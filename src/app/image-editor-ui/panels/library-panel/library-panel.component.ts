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
import {openUploadWindow} from '@common/uploads/utils/open-upload-window';

@Component({
    selector: 'library-panel',
    templateUrl: './library-panel.component.html',
    styleUrls: ['./library-panel.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class LibraryPanelComponent {
    public library = [];
    public showList = true;
    public showInput = false;
    // @Select(EditorState.activeObjId) activeObjId$: Observable<string>;

    constructor(
        // public library: LibraryListService,
        public panelRef: OverlayPanelRef,
        private controls: EditorControlsService,
        private state: CanvasStateService,
        private canvas:CanvasService,
        private store: Store,
        private http: HttpClient,
        private textTool: TextToolService
    ) {
        // this.state.library = this.canvas.loadLibrary();
        this.state.library.map (object => {
            this.library.push(object);
        });
    }

    public getIcon(string): string {
        if (string == 'image') {
            return 'photo-library';
        } else {
            return 'text-box-custom';
        }   
    }

    // public newImage() {
    //     openUploadWindow({extensions: accept}).then(files => {
    //         this.http.post('https://theaamgroup.com/image-editor/addCustomImageToLibrary', {
    //             image:files[0]
    //         })
    //         // this.loadFile(files[0]);
    //     });
    // }

    // public showTextPanel() {
    //     this.showList = false;
    //     this.showInput = true;
    // }

    //possibly use this, otherwise just use add Image to access custom images
    // public showImagePanel() {
    // }

    // public newText() {

    // }

    public addObject(object) {
        if (object.Type == 'image') {
           this.canvas.openImage(object.Value, false, object.Name);
        } else {
            this.textTool.add(object.Value);
        }
    }
}
