import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {ActiveObjectService} from '../../../../image-editor/canvas/active-object/active-object.service';
import { CanvasStateService } from 'app/image-editor/canvas/canvas-state.service';
import { EditorControlsService } from '../../editor-controls.service';
import { ImageEditorService } from 'app/image-editor/image-editor.service';

@Component({
    selector: 'opacity-controls-drawer',
    templateUrl: './opacity-controls-drawer.component.html',
    styleUrls: ['./opacity-controls-drawer.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpacityControlsDrawer {
    public currentObjectInfo: any; 
    constructor(
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

        public removeEffect() {
            this.activeObject.setValues({
                opacity:1
            });
            this.state.action = 'removing';
            this.imageEditor.applyChanges();
            this.editor.closeCurrentPanel();
        }
}
