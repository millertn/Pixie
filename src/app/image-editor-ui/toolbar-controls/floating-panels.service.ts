import {ElementRef, Injectable} from '@angular/core';
import {OverlayPanel} from 'common/core/ui/overlay-panel/overlay-panel.service';
import {OverlayPanelRef} from 'common/core/ui/overlay-panel/overlay-panel-ref';
import {ObjectsPanelComponent} from '../panels/objects-panel/objects-panel.component';
import {LibraryPanelComponent} from '../panels/library-panel/library-panel.component';
import {AddPartPanelComponent} from '../panels/add-part-panel/add-part-panel.component';
import {CanvasStateService} from '../../image-editor/canvas/canvas-state.service';
import {OpenSampleImagePanelService} from '../panels/open-sample-image-panel/open-sample-image-panel.service';
import {HistoryPanelComponent} from '../panels/history-panel/history-panel.component';
import {ExportPanelComponent} from '../panels/export-panel/export-panel.component';
import {OverlayPanelConfig} from '@common/core/ui/overlay-panel/overlay-panel-config';
import {BreakpointsService} from '@common/core/ui/breakpoints.service';
import {Modal} from '@common/core/ui/dialogs/modal.service';

@Injectable()
export class FloatingPanelsService {
    private historyPanelRef: OverlayPanelRef;
    private objectsPanelRef: OverlayPanelRef;
    private libraryPanelRef: OverlayPanelRef;
    private addPartPanelRef: OverlayPanelRef;

    constructor(
        private overlayPanel: OverlayPanel,
        private state: CanvasStateService,
        private openSampleImageDialog: OpenSampleImagePanelService,
        private breakpoints: BreakpointsService,
        private dialog: Modal,
    ) {}

    public openSampleImagePanel() {
        this.openSampleImageDialog.open();
    }

    public openExportPanel() {
        this.dialog.open(ExportPanelComponent, null, {panelClass: 'export-panel-dialog-container'});
    }

    public toggleHistory() {
        this.closePanel('objects');
        this.closePanel('library');

        if (this.panelIsOpen('history')) {
            this.historyPanelRef.close();
        } else {
            this.openHistoryPanel();
        }
    }

    public toggleObjects() {
        this.closePanel('history');
        this.closePanel('library');

        if (this.panelIsOpen('objects')) {
            this.objectsPanelRef.close();
        } else {
            this.openObjectsPanel();
        }
    }

    public toggleLibrary() {
        this.closePanel('objects');
        this.closePanel('history');

        if (this.panelIsOpen('library')) {
            this.libraryPanelRef.close();
        } else {
            this.openLibraryPanel();
        }
    }

    public openHistoryPanel() {
        this.historyPanelRef = this.overlayPanel.open(
            HistoryPanelComponent,
            this.getPanelConfig(),
        );
    }

    public openObjectsPanel() {
        this.objectsPanelRef = this.overlayPanel.open(
            ObjectsPanelComponent,
            this.getPanelConfig(),
        );
    }

    public openLibraryPanel() {
        this.libraryPanelRef = this.overlayPanel.open(
            LibraryPanelComponent,
            this.getPanelConfig(),
        );
    }

    public openAddPartPanel() {
        this.addPartPanelRef = this.overlayPanel.open(
            AddPartPanelComponent,
            this.getPanelConfig(),
        );
    }

    public closePanel(name: 'history' | 'objects' | 'objectOptions' | 'library' | 'add-part') {
        switch (name) {
            case 'history':
                this.historyPanelRef && this.historyPanelRef.close();
                break;
            case 'objects':
                this.objectsPanelRef && this.objectsPanelRef.close();
                break;
            case 'library':
                this.libraryPanelRef && this.libraryPanelRef.close();
                break;
            case 'library':
                this.addPartPanelRef && this.addPartPanelRef.close();
                break;
        }
    }

    public panelIsOpen(name : 'history' | 'objects' | 'library' | 'add-part'): boolean {
        let ref = null;
        switch (name) {
            case 'history' : ref = this.historyPanelRef;
                break;
            case 'objects': ref = this.objectsPanelRef;
                break;
            case 'library': ref = this.libraryPanelRef;
                break;
            case 'add-part': ref = this.addPartPanelRef;
                break;
        }
        return ref && ref.isOpen();
    }

    private getPanelConfig(): OverlayPanelConfig {
        return {
            hasBackdrop: false,
            positionStrategy: this.getPositionStrategy(),
            panelClass: 'floating-panel',
        };
    }

    private getPositionStrategy() {
        if (this.breakpoints.isMobile$.value) {
            return this.overlayPanel.overlay.position()
                .flexibleConnectedTo(new ElementRef(this.state.wrapperEl))
                .withPositions([{overlayX: 'center', overlayY: 'center', originX: 'center', originY: 'center'}]);
        }

        return this.overlayPanel.overlay.position()
            .flexibleConnectedTo(new ElementRef(this.state.wrapperEl))
            .withPositions([{
                overlayX: 'end',
                overlayY: 'bottom',
                originX: 'end',
                originY: 'bottom',
                offsetY: -10,
                offsetX: -10
            }]);
    }
}
