import {ChangeDetectionStrategy, Component, ViewEncapsulation, OnInit} from '@angular/core';
import {Select, Store} from '@ngxs/store';
import {CloseForePanel, OpenPanel} from '../../../../image-editor/state/editor-state-actions';


@Component({
    selector: 'pane-drawer',
    templateUrl: './pane-drawer.component.html',
    styleUrls: ['./pane-drawer.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {'class': 'controls-drawer'},
})
export class PaneDrawerComponent {

    constructor(
        private store: Store,
    ) {}

    public openPanel(name) {
        this.store.dispatch(new OpenPanel(name));
    }
}