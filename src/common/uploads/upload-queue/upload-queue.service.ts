import { Injectable } from '@angular/core';
import { UploadQueueItem } from './upload-queue-item';
import { BehaviorSubject, EMPTY, from, ReplaySubject, Subject, throwError } from 'rxjs';
import { catchError, filter, map, mergeMap, takeUntil } from 'rxjs/operators';
import { UploadedFile } from '../uploaded-file';
import { UploadCompletedEvent, UploadEvent, UploadEventTypes, UploadProgressEvent } from '../utils/upload-progress-event';
import { UploadFileResponse, UploadsApiService } from '../uploads-api.service';
import { FileEntry } from '../types/file-entry';
import { UploadValidator } from '../validation/upload-validator';
import { BackendErrorResponse } from '../../core/types/backend-error-response';
import { DefaultUploadValidator } from '../validation/default-upload-validator';
import { BackendResponse } from '@common/core/types/backend-response';
import { Toast } from '@common/core/ui/toast.service';
import { HttpErrors } from '@common/core/http/errors/http-errors.enum';
import {UploadApiConfig} from '@common/uploads/types/upload-api-config';

@Injectable({
    providedIn: 'root'
})
export class UploadQueueService {
    public uploads$ = new BehaviorSubject<UploadQueueItem[]>([]);
    public totalProgress$ = new ReplaySubject<number>(1);
    public uploadsAdded$ = new Subject<UploadQueueItem[]>();
    public count$ = new BehaviorSubject<{pending: number, completed: number}>({pending: 0, completed: 0});

    constructor(
        private api: UploadsApiService,
        private defaultValidator: DefaultUploadValidator,
        private toast: Toast,
    ) {}

    public isEmpty(): boolean {
        return !this.uploads$.value.length;
    }

    public getAllCompleted(): FileEntry[] {
        return this.uploads$.value
            .filter(queueItem => queueItem.completed)
            .map(queueItem => queueItem.fileEntry);
    }

    public updateTotalProgress() {
        const progress = this.uploads$.value.map(upload => upload.progress$.value.percentage || 0);
        this.totalProgress$.next(progress.reduce((p, c) => p + c, 0) / progress.length);
    }

    public totalProgress() {
        return this.totalProgress$.asObservable();
    }

    public start(files: UploadedFile[], config: UploadApiConfig = {}): BackendResponse<UploadFileResponse> {
        const validator = config.validator || this.defaultValidator;
        const uploadQueueItems = this.transformUploads(files, validator);
        this.uploads$.next(this.uploads$.value.concat(uploadQueueItems));
        this.uploadsAdded$.next(uploadQueueItems);
        this.updateCount();

        return from(uploadQueueItems)
            .pipe(
                mergeMap(uploadQueueItem => {
                    return this.api.upload(uploadQueueItem.uploadedFile, config).pipe(
                        catchError(err => {
                            this.handleUploadFailure(err, uploadQueueItem, validator);
                            // if one item in the queue fails, either continue uploading other items
                            // or immediately stop uploading and bubble up error to subscribers
                            return config.bubbleError ? throwError(err) : EMPTY;
                        }),
                        takeUntil(uploadQueueItem.canceled$),
                        map(response => {
                            this.handleUploadEvent(response, uploadQueueItem);
                            // assign queue item ID to upload completed response so
                            // file entry can be matched to specific upload queue item
                            if (response.name === UploadEventTypes.COMPLETED) {
                                response.body.queueItemId = uploadQueueItem.id;
                            }
                            return response;
                        }),
                    );
                }, 1),
                filter(e => e.name === UploadEventTypes.COMPLETED),
                map((e: UploadCompletedEvent) => e.body)
            );
    }

    public updateProgress(id: string, e: UploadProgressEvent) {
        const queueItem = this.find(id);
        if ( ! queueItem) return;

        queueItem.setProgress({
            eta: e.eta,
            speed: e.speed,
            percentage: e.progress,
            totalBytes: e.totalBytes,
            completedBytes: e.completedBytes,
        });

        this.updateTotalProgress();
    }

    public completeUpload(id: string, response: UploadFileResponse) {
        const queueItem = this.find(id);
        if ( ! queueItem) return;

        queueItem.uploadedResponse$.next(response);
        queueItem.fileEntry = response.fileEntry;
        queueItem.complete();
        this.updateTotalProgress();
    }

    public errorUpload(id: string, message?: string) {
        this.find(id).addError(message);
    }

    public reset() {
        this.uploads$.value.forEach(u => u.cancel());
        this.uploads$.next([]);
    }

    public remove(id: string) {
        const i = this.uploads$.value.findIndex(u => u.id === id),
            upload = this.uploads$.value[i];
        upload.completed ? upload.finalize() : upload.cancel();
        this.uploads$.value.splice(i, 1);
        this.uploads$.next(this.uploads$.value);
    }

    public find(id: string): UploadQueueItem {
        return this.uploads$.value.find(u => u.id === id);
    }

    /**
     * Transform specified files into upload queue items.
     */
    protected transformUploads(files: UploadedFile[], validator: UploadValidator) {
        return files.map(file => {
            const activeUpload = new UploadQueueItem(file);

            // validate upload
            if (validator) {
                const result = validator.validate(file);
                if (result.failed) activeUpload.addError(result.errorMessage);
            }

            return activeUpload;
        });
    }

    protected handleUploadEvent(event: UploadEvent, upload: UploadQueueItem) {
        if (event.name === UploadEventTypes.PROGRESS) {
            // upload is considered complete when progress equals 100
            // but file processing for large files might take some time
            // after file is fully uploaded so we should only set
            // progress as 100 on final completed response
            if (event.progress === 100) {
                event = {...event, progress: 99};
            }
            this.updateProgress(upload.id, event);
        } else if (event.name === UploadEventTypes.COMPLETED) {
            this.completeUpload(upload.id, event.body);
            this.updateCount();
        }
    }

    protected handleUploadFailure(response: BackendErrorResponse, upload: UploadQueueItem, validator: UploadValidator) {
        const msg = response.messages && response.messages.file ?
            response.messages.file :
            HttpErrors.DefaultUpload;

        this.errorUpload(upload.id, msg);
        this.updateCount();

        if (validator.showToast) {
            this.toast.open(msg);
        }
    }

    private updateCount() {
        const pending = this.uploads$.value.filter(u => u.inProgress).length;
        this.count$.next({pending, completed: this.uploads$.value.length - pending});
    }
}
