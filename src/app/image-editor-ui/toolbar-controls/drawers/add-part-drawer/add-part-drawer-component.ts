import {ChangeDetectionStrategy, Component, ViewEncapsulation, OnInit} from '@angular/core';
import { CloseForePanel } from 'app/image-editor/state/editor-state-actions';
import {Store} from '@ngxs/store';
import { CanvasService } from 'app/image-editor/canvas/canvas.service';
import { ActiveObjectService } from 'app/image-editor/canvas/active-object/active-object.service';

@Component({
    selector: 'add-part-drawer',
    templateUrl: './add-part-drawer-component.html',
    styleUrls: ['./add-part-drawer-component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {'class': 'controls-drawer'},
})
export class AddPartDrawerComponent {

    constructor(
        private store: Store,
        private canvas: CanvasService,
        private activeObject: ActiveObjectService
    ) {
        
    }

    public cancelAdding() {
        this.store.dispatch(new CloseForePanel());

        let objects = this.canvas.fabric().getObjects();
        let placeholder = null;
        objects.map(object => {
            if (object.name == "Placeholder Div") {
                placeholder = object;
            }
        });
        this.canvas.fabric().setActiveObject(placeholder);
        this.activeObject.delete();
    }
}