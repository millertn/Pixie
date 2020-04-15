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
        private state:CanvasStateService,
        private imageEditor:ImageEditorService,
        private activeFrams:ActiveFrameService,
        private editor:EditorControlsService
    ) {
        this.state.pages.map(page => {
            this.pages.push(page);
        });
    }

    //might need to move this into state so I can also dynamically upload the view?
    // force clsoe the panel instead you imbecile
    switchPage (projectId) {
        let state = null;
        let id = null;
        let groupId = null;
        let stateObjs = null
        let paned = false;
        let version = 0;
        this.pages.map(page => {
            if (page.RowID == projectId) {
                id = page.RowID;
                state = page.ProjectState;
                groupId = page.ProjectGroupID;
                stateObjs = page.CanvasStateObjects;
                version = page.Paned
            }
        });
        this.imageEditor.loadState(state);
        if (version > 0) {
            paned = true;
        }
        this.imageEditor.setStateObjects(id, groupId, this.state.userId, stateObjs, paned, version, '', false);
        this.imageEditor.applyChanges();
        this.editor.closeCurrentPanel();
    }

    addPage() {
        this.imageEditor.applyChanges();
        this.editor.closeCurrentPanel();
    }
}