import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {Settings} from 'common/core/config/settings.service';
import {CloseForePanel, OpenPanel} from '../../../../image-editor/state/editor-state-actions';
import {Project} from '../../../../image-editor/tools/projects/default-projects';
import {Select, Store} from '@ngxs/store';
import {DrawerName} from '../../drawers/drawer-name.enum';
import {ToolsState} from '../../../state/tools/tools.state';
import {Observable} from 'rxjs';
// import {AddShape} from '../../../state/shapes/shapes.actions';

@Component({
    selector: 'tools-drawer',
    templateUrl: './tools-drawer.component.html',
    styleUrls: ['./tools-drawer.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {'class': 'controls-drawer'},
})
export class ToolsDrawerComponent {
    constructor(
        private config: Settings,
        private store: Store,
    ) {}

    public openPanel(name) {
        this.store.dispatch(new OpenPanel(name));
    }

}