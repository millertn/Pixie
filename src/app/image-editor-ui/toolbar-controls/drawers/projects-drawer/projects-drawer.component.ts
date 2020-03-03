import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {Settings} from 'common/core/config/settings.service';
import {Select, Store} from '@ngxs/store';
import {ProjectsState} from '../../../state/projects/projects.state';
import {Observable} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ImportToolService } from 'app/image-editor/tools/import/import-tool.service';

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
        private importTool:ImportToolService
    ) {
    }

    public triggerUpload() {
        this.importTool.openUploadDialog();
    }
}