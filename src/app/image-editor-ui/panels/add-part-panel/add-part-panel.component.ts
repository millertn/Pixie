import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
// import {LibraryListService} from '../../../image-editor/objects/library-list.service';
import {OverlayPanelRef} from 'common/core/ui/overlay-panel/overlay-panel-ref';
import {Object} from 'fabric/fabric-impl';
import {EditorControlsService} from '../../toolbar-controls/editor-controls.service';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {CanvasStateService} from '../../../image-editor/canvas/canvas-state.service';
import {Select, Store} from '@ngxs/store';
import {EditorState} from '../../../image-editor/state/editor-state';
import {OpenPanel} from '../../../image-editor/state/editor-state-actions';
import {DrawerName} from '../../toolbar-controls/drawers/drawer-name.enum';
import {ObjectNames} from '../../../image-editor/objects/object-names.enum';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import { CanvasService } from 'app/image-editor/canvas/canvas.service';
import { TextToolService } from 'app/image-editor/tools/text/text-tool.service';
import { ActiveObjectService } from 'app/image-editor/canvas/active-object/active-object.service';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'add-part-panel',
    templateUrl: './add-part-panel.component.html',
    styleUrls: ['./add-part-panel.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class AddPartPanelComponent {
    faQuestionCircle = faQuestionCircle;
    popupText = "";
    constructor(
        // public library: LibraryListService,
        public panelRef: OverlayPanelRef,
        private controls: EditorControlsService,
        public state: CanvasStateService,
        private canvas:CanvasService,
        private store: Store,
        private http: HttpClient,
        private textTool: TextToolService,
        private activeObject:ActiveObjectService,
    ) {

        if (this.state.paned == true) {
            this.popupText = 'click Cancel to cancel adding a part.'
        } else {
            this.popupText = 'Move and Resize the placeholder to where you want your part to be. Click Add Part and your part will be dynamically added into the placeholder, click Cancel to cancel and remove the placeholder.'
        }
    }

    public cancelAdding() {
        this.panelRef.close();

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