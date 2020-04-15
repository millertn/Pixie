import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {Select, Store} from '@ngxs/store';
import {ProjectsState} from '../../../state/projects/projects.state';
import {Observable} from 'rxjs';
import { ImportToolService } from 'app/image-editor/tools/import/import-tool.service';
import {FloatingPanelsService} from '../../floating-panels.service';
import { EditorControlsService } from '../../editor-controls.service';

@Component({
    selector: 'projects-drawer',
    templateUrl: './projects-drawer.component.html',
    styleUrls: ['./projects-drawer.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {'class': 'controls-drawer'},
})
export class ProjectsDrawerComponent {
    @Select(ProjectsState.dirty) dirty$: Observable<boolean>;
    constructor(
        public panels: FloatingPanelsService,
        private importTool:ImportToolService,
        public editor: EditorControlsService

    ) {
    }
    
    public triggerUpload() {
        this.importTool.openUploadDialog();
        this.editor.closeCurrentPanel();
    }
}