import {Injectable} from '@angular/core';
import {fabric} from 'fabric';
import {IEvent, Image, Image as FImage, Object} from 'fabric/fabric-impl';
import {CanvasPanService} from './canvas-pan.service';
import {ActiveObjectService} from './active-object/active-object.service';
import {CanvasZoomService} from './canvas-zoom.service';
import {Settings} from 'common/core/config/settings.service';
import {staticObjectConfig} from '../objects/static-object-config';
import {CanvasStateService} from './canvas-state.service';
import {Store} from '@ngxs/store';
import {ContentLoaded} from '../state/editor-state-actions';
import {ObjectNames} from '../objects/object-names.enum';
import { HttpClient } from '@angular/common/http';
import { max } from 'rxjs/operators';

@Injectable()
export class CanvasService {
    private readonly minWidth: number = 50;
    private readonly minHeight: number = 50;
    public activeObjects = new Array;

    constructor(
        public pan: CanvasPanService,
        public zoom: CanvasZoomService,
        public state: CanvasStateService,
        public activeObject: ActiveObjectService,
        private config: Settings,
        private store: Store,
        private http: HttpClient
    ) {}

    public render() {
        this.state.fabric.requestRenderAll();
    }

    public fabric(): fabric.Canvas {
        return this.state.fabric;
    }

    public getObjectById(id: string): Object|null {
        return this.state.fabric.getObjects().find(obj => {
            return obj.data && obj.data.id === id;
        });
    }

    public resize(width: number, height: number) {
        this.state.fabric.setWidth(width * this.zoom.getScaleFactor());
        this.state.fabric.setHeight(height * this.zoom.getScaleFactor());
        this.state.original.width = width;
        this.state.original.height = height;
    }

    public loadMainImage(url: string, clearCanvas = true): Promise<Image> {
        return new Promise(resolve => {
            this.loadImage(url).then(img => {
                if ( ! clearCanvas) {
                    const bgImage = this.getMainImage();
                    this.fabric().remove(bgImage);
                } else {
                    this.fabric().clear();
                }
                img.set(staticObjectConfig);
                img.name = ObjectNames.mainImage.name;
                this.state.fabric.add(img);
                // this.addObjectToTracked(img.data.id);
                this.resize(img.width, img.height);
                this.zoom.fitToScreen();
                this.store.dispatch(new ContentLoaded());
                resolve(img);
                const callback = this.config.get('pixie.onMainImageLoaded');
                if (callback) callback(img);
            });
        });
    }

    public loadImage(data: string): Promise<Image> {
        return new Promise(resolve => {
            fabric.util.loadImage(
                data,
                img => resolve(new fabric.Image(img)),
                null,
                this.config.get('pixie.crossOrigin')
            );
        });
    }

    public openNew(width: number, height: number): Promise<{width: number, height: number}> {
        width = width < this.minWidth ? this.minWidth : width;
        height = height < this.minHeight ? this.minHeight : height;

        this.state.fabric.clear();
        this.state.action = "setting";
        this.state.canvasObjects = [];
        this.state.paned = false;
        this.state.activePane = "";
        this.resize(width, height);

        return new Promise(resolve => {
            setTimeout(() => {
                this.zoom.fitToScreen();
                this.store.dispatch(new ContentLoaded());
                resolve({width, height});
            });
        });
    }

    /**
     * Open image at given url in canvas.
     */
    public openImage(url, fitToScreen = true, name): Promise<Image> {
        return new Promise(resolve => {
            fabric.util.loadImage(url, image => {
                if ( ! image) return;

                const object = new fabric.Image(image);
                object.name = name;
                object.lockUniScaling = false;

                // use either main image or canvas dimensions as outer boundaries for scaling new image
                if (this.state.activePane != "") {
                    let placeholderObj = null;
                    let objects = this.fabric().getObjects();
                    objects.map(object => {
                        if (object.data.id == this.state.activePane) {
                            placeholderObj = object;
                        }
                    });

                    const maxWidth  = placeholderObj.width,
                    maxHeight = placeholderObj.height;

                    if ((object.width >= maxWidth || object.height >= maxHeight)) {

                        // calc new image dimensions (main image height - 10% and width - 10%)
                        const newWidth  = maxWidth - (0.1 * maxWidth),
                            newHeight = maxHeight - (0.1 * maxHeight),
                            scale     = 1 / (Math.min(newHeight / object.getScaledHeight(), newWidth / object.getScaledWidth()));
    
                        // scale newly uploaded image to the above dimensions
                        object.scaleX = object.scaleX * (1 / scale);
                        object.scaleY = object.scaleY * (1 / scale);
                    }

                    object.top = placeholderObj.top;
                    object.left = placeholderObj.left;
                    this.state.fabric.add(object);
                    this.render();
                    this.zoom.fitToScreen();
                    resolve(object);
                    this.addObjectToTracked(object.data.id);
                } else {
                    const maxWidth  = this.state.original.width,
                    maxHeight = this.state.original.height;

                    // if image is wider or higher then the current canvas, we'll scale it down
                    if (fitToScreen && (object.width >= maxWidth || object.height >= maxHeight)) {

                        // calc new image dimensions (main image height - 10% and width - 10%)
                        const newWidth  = maxWidth - (0.1 * maxWidth),
                            newHeight = maxHeight - (0.1 * maxHeight),
                            scale     = 1 / (Math.min(newHeight / object.getScaledHeight(), newWidth / object.getScaledWidth()));

                        // scale newly uploaded image to the above dimensions
                        object.scaleX = object.scaleX * (1 / scale);
                        object.scaleY = object.scaleY * (1 / scale);
                    }

                    // center and render newly uploaded image on the canvas
                    this.state.fabric.add(object);
                    object.viewportCenter();
                    object.setCoords();
                    this.render();
                    this.zoom.fitToScreen();
                    resolve(object);
                    this.addObjectToTracked(object.data.id);
                    
                }
            });
        });
    }

    /**
     * Get main image object, if it exists.
     */
    public getMainImage(): FImage {
        return this.state.fabric.getObjects()
            .find(obj => obj.name === ObjectNames.mainImage.name) as FImage;
    }

    /**
     * Listen to specified canvas event.
     */
    public on(eventName: string, handler: (e: IEvent) => void) {
        this.fabric().on(eventName, handler);
    }

    public loadLibrary() {
        let url = "https://theaamgroup.com/image-editor/getLibrary?userId=" + this.state.userId;
        let temp = [];
        this.http.get(url, {
            headers: {'Access-Control-Allow-Origin': "*"}
        }).subscribe(data => {
            for (let page in data) {
                temp.push(data[page]);
            }
        }, err => {
            throw new Error('Something went wrong =(');
        });
        return temp;
    }

    public loadPages() {
        let url = "https://theaamgroup.com/image-editor/getGroupProjects?userId=" + this.state.userId + "&projectId=" + this.state.groupId;
        let temp = [];
        this.http.get(url, {
            headers: {'Access-Control-Allow-Origin': "*"}
        }).subscribe(data => {
            for (let page in data) {
                temp.push(data[page]);
            }
        }, err => {
            throw new Error('Something went wrong =(');
        });
        return temp;
    }

    //TODO missingNewlineOffset for newlines?
    public openPartImages(quadrant) {
        quadrant.data.map( (image, index) => {
            fabric.util.loadImage(image, returnImage => {

                const object = new fabric.Image(returnImage);
                object.name = quadrant.name +" - "+ (index + 1);
                object.lockUniScaling = false;

                if ((object.width >= quadrant.width || object.height >= quadrant.height)) {
                    // calc new image dimensions (main image height and width)
                    const newWidth  = quadrant.width,
                        newHeight = quadrant.height,
                        scale     = 1 / (Math.min(newHeight / object.getScaledHeight(), newWidth / object.getScaledWidth()));

                    // scale newly uploaded image to the above dimensions
                    object.scaleX = object.scaleX * (1 / scale);
                    object.scaleY = object.scaleY * (1 / scale);
                }

                object.top = quadrant.positionY;
                object.left = quadrant.positionX;
                this.state.fabric.add(object);


                
                this.addObjectToTracked(object.data.id);
                this.render();
                this.zoom.fitToScreen();
            });
        });
    }

    public addObjectToTracked(id) {
        this.state.canvasObjects.push({
            id:id,
            shadow:false,
            outline:false,
            background:false,
            opacity:false,
            texture:false,
            gradient:false
        });
    }
}
