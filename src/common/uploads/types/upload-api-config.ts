import {UploadValidator} from '@common/uploads/validation/upload-validator';
import {UploadHttpParams} from '@common/uploads/types/upload-http-params';

export interface UploadApiConfig {
    uri?: string;
    validator?: UploadValidator;
    bubbleError?: boolean;
    httpParams?: UploadHttpParams;
}
