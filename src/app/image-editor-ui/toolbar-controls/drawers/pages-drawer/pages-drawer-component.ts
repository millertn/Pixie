import {ChangeDetectionStrategy, Component, ViewEncapsulation, OnInit} from '@angular/core';
import {Settings} from 'common/core/config/settings.service';
import {Select, Store} from '@ngxs/store';
import {ProjectsState} from '../../../state/projects/projects.state';
import {Observable} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ImportToolService } from 'app/image-editor/tools/import/import-tool.service';
import { CanvasStateService } from '../../../../image-editor/canvas/canvas-state.service';
import { ImageEditorService } from '../../../../image-editor/image-editor.service';
import {ActiveFrameService} from '../../../../image-editor/tools/frame/active-frame.service';
import { EditorControlsService } from '../../editor-controls.service';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import { CanvasService } from 'app/image-editor/canvas/canvas.service';
import { CloseForePanel } from 'app/image-editor/state/editor-state-actions';

@Component({
    selector: 'pages-drawer',
    templateUrl: './pages-drawer-component.html',
    styleUrls: ['./pages-drawer-component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {'class': 'controls-drawer'},
})
export class PagesDrawerComponent {
    public pages = [];
    public currentPage = this.state.canvasId;
    constructor(
        private http:HttpClient,
        public state:CanvasStateService,
        private imageEditor:ImageEditorService,
        private activeFrams:ActiveFrameService,
        private editor:EditorControlsService,
        private canvas:CanvasService,
        private store: Store
    ) {
        // this.state.pages = this.canvas.loadPages();
        this.state.pages.map(page => {
            this.pages.push(page);
        });
        console.log(this.state.pages);
        console.log(this.pages);

    }
    closePanel() {
        this.store.dispatch(new CloseForePanel());
    }
}