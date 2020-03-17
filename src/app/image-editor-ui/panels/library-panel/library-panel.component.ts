import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
// import {LibraryListService} from '../../../image-editor/objects/library-list.service';
import {OverlayPanelRef} from 'common/core/ui/overlay-panel/overlay-panel-ref';
import {Object} from 'fabric/fabric-impl';
import {LibraryObject} from 'fabric/fabric-impl';
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

@Component({
    selector: 'library-panel',
    templateUrl: './library-panel.component.html',
    styleUrls: ['./library-panel.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class LibraryPanelComponent {
    // @Select(EditorState.activeObjId) activeObjId$: Observable<string>;

    constructor(
        // public library: LibraryListService,
        public panelRef: OverlayPanelRef,
        private controls: EditorControlsService,
        private canvasState: CanvasStateService,
        private store: Store,
        private http: HttpClient,
    ) {

       this.http.get("https://theaamgroup.com/image-editor/test", {
           headers: {'Access-Control-Allow-Origin': "*"}
       }).subscribe(data => {
           console.log(data);
       }, err => {
           console.log(err);
       });
    }

    public getIcon(object: Object): string {
        // if (typeof ObjectNames[object.name] === "undefined") {
        //     return 'photo-library';
        // } else {
        //     return ObjectNames[object.name].icon;
        // }
        return 'photo-library';
            
    }

    public selectObject(object: LibraryObject) {
        // this.library.select(object);
        // if ( ! this.store.selectSnapshot(EditorState.dirty)) {
        //     this.store.dispatch(new OpenPanel(DrawerName.OBJECT_SETTINGS));
        // }
    }

    public getObjectDisplayName(object: Object): string {
        const name = object.name;
        return name ? name.replace(/([A-Z])/g, ' $1') : '';
    }

    public reorderObjects(e: CdkDragDrop<string>) {
        // moveItemInArray(this.library.getAll(), e.previousIndex, e.currentIndex);

        // pixie and canvas object orders are reversed, need to
        // reverse newIndex given by cdk drag and drop
        // const index = this.library.getAll()
        //     .slice().reverse().findIndex(obj => obj.data.id === e.item.data);

        // this.library.getById(e.item.data).moveTo(index);
        this.canvasState.fabric.requestRenderAll();
    }

    public shouldDisableObject(object: Object): boolean {
        return !object.selectable && object.name !== ObjectNames.drawing.name;
    }
}
