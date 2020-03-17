import {Injectable, NgZone} from '@angular/core';
import {LibraryObject} from 'fabric/fabric-impl';
import {CanvasService} from '../canvas/canvas.service';
import {ActiveObjectService} from '../canvas/active-object/active-object.service';
import {Store} from '@ngxs/store';
import {ObjectsSynced} from '../state/editor-state-actions';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class LibraryListService {
    private library: LibraryObject[] = [];

    constructor(
        private canvas: CanvasService,
        private store: Store,
        private zone: NgZone,
        private http: HttpClient,
    ) {
        this.init();
    }

    /**
     * Get all objects that are currently on canvas.
     */
    public getAll() {
        return this.library;
    }

    /**
     * Get object with specified name from canvas.
     */
    public get(name: string) {
        return this.library.find(obj => obj.name === name);
    }

    /**
     * Get object with specified id from canvas.
     */
    // public getById(id: string) {
    //     return this.library.find(obj => obj.id === id);
    // }

    /**
     * Check whether specified object is currently selected.
     */
    // public isActive(objectOrId: Object|string): boolean {
    //     const objId = typeof objectOrId === 'string' ? objectOrId : objectOrId.data.id;
    //     return this.activeObject.getId() === objId;
    // }

    /**
     * Check if object with specified name exists on canvas.
     */
    public has(name: string) {
        return this.library.findIndex(obj => obj.name === name) > -1;
    }

    /**
     * Select specified object.
     */
    public select(object: Object) {
        // this.canvas.state.fabric.setActiveObject(object);
        // this.canvas.state.fabric.requestRenderAll();
    }

    /**
     * Sync layers list with fabric.js objects.
     * @hidden
     */
    public syncObjects() {
        return(this.http.get("https://theaamgroup.com/image-editor/test"));
        // this.objects = this.canvas.fabric().getObjects()
        //     .filter(object => {
        //         if ( ! object.name) return;

        //         return object.name.indexOf('crop.') === -1 &&
        //             object.name.indexOf('round.') === -1 &&
        //             object.name.indexOf('frame.') === -1;
        //     }).reverse();
        // this.store.dispatch(new ObjectsSynced());
    }

    /**
     * @hidden
     */
    public init() {
        this.canvas.state.loaded.subscribe(() => {
            this.syncObjects();
            console.log(this.http.get("https://theaamgroup.com/image-editor/test"));

            // this.canvas.fabric().on('object:added', () => {
            //     this.zone.run(() => this.syncObjects());
            // });

            // this.canvas.fabric().on('object:removed', () => {
            //     this.zone.run(() => this.syncObjects());
            // });
        });
    }
}
