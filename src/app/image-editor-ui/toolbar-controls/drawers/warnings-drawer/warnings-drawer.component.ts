import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {Settings} from 'common/core/config/settings.service';
import {Select, Store} from '@ngxs/store';
import {WarningsState} from '../../../state/warnings/warnings.state';
import {Observable} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ImportToolService } from 'app/image-editor/tools/import/import-tool.service';
import { EditorControlsService } from '../../editor-controls.service';

@Component({
    selector: 'warnings-drawer',
    templateUrl: './warnings-drawer.component.html',
    styleUrls: ['./warnings-drawer.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {'class': 'controls-drawer'},
})
export class WarningsDrawerComponent {
    // @Select(ProjectsState.dirty) dirty$: Observable<boolean>;
    constructor(
        private editor:EditorControlsService
    ) {
    }

    closePanel() {
        this.editor.closeCurrentPanel();
    }
}