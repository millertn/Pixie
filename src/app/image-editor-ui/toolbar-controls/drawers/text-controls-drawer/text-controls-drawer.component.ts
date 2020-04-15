import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {ActiveObjectService} from '../../../../image-editor/canvas/active-object/active-object.service';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { CanvasService } from 'app/image-editor/canvas/canvas.service';
import { Textbox } from 'fabric/fabric-impl';
import { IText } from 'fabric/fabric-impl';

@Component({
    selector: 'text-controls-drawer',
    templateUrl: './text-controls-drawer.component.html',
    styleUrls: ['./text-controls-drawer.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextControlsDrawerComponent {
    public currentObject : any;
    constructor(
        public activeObject: ActiveObjectService,
        public canvas:CanvasService,
    ) {
        // let currentObject = null;
        this.canvas.fabric()._objects.map(object => {
            if (object.data.id == this.activeObject.getId()) {
                this.currentObject = object as IText;
            }
        });
        // console.log(this.activeObject.form.get('fontSize'));
    }

    public setTextStyle(e: MatButtonToggleChange) {
        this.activeObject.form.patchValue({
            underline: e.value.indexOf('underline') > -1,
            linethrough: e.value.indexOf('linethrough') > -1,
            fontStyle: e.value.indexOf('italic') > -1 ? 'italic' : 'normal',
        });
    }

    public setFontSize(event) {
        // let currentObject = null;s
        console.log(event.target.value);
        this.currentObject.fontSize = event.target.value;
        this.canvas.render();
    }
}
