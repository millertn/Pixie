import {Component, ElementRef, ViewChild, ViewEncapsulation} from '@angular/core';
import {ColorpickerPanelComponent} from 'common/core/ui/color-picker/colorpicker-panel.component';
import {OverlayPanel} from 'common/core/ui/overlay-panel/overlay-panel.service';
import {ActiveObjectService} from '../../../image-editor/canvas/active-object/active-object.service';
import {BOTTOM_POSITION} from '@common/core/ui/overlay-panel/positions/bottom-position';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { CanvasStateService } from 'app/image-editor/canvas/canvas-state.service';
import { EditorControlsService } from '../editor-controls.service';
import { ImageEditorService } from 'app/image-editor/image-editor.service';

@Component({
    selector: 'shadow-controls-drawer',
    templateUrl: './shadow-controls-drawer.component.html',
    styleUrls: ['./shadow-controls-drawer.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class ShadowControlsDrawer {
    faQuestionCircle = faQuestionCircle;
    @ViewChild('colorPickerButton', {read: ElementRef, static: false}) colorPickerButton: ElementRef;
    public currentObjectInfo: any; 

    constructor(
        private overlayPanel: OverlayPanel,
        public activeObject: ActiveObjectService,
        public state: CanvasStateService,
        public editor: EditorControlsService,
        public imageEditor: ImageEditorService,
    ) {
        this.state.canvasObjects.map(object => {
            if(object.id == this.activeObject.getId()) {
                this.currentObjectInfo = object;
            }
        });
    }

    public openColorPicker() {
        this.overlayPanel.open(ColorpickerPanelComponent, {position: BOTTOM_POSITION, origin: this.colorPickerButton})
            .valueChanged().subscribe(color => {
                this.activeObject.form.get('shadow.color').patchValue(color);
            });
    }

    public removeEffect() {
        this.activeObject.setValues({
            shadow: {
                color: '#FFF',
                blur: 0,
                offsetX: 0,
                offsetY: 0,
            }
        });
        this.state.action = 'removing';
        this.imageEditor.applyChanges();
        this.editor.closeCurrentPanel();
    }
}

