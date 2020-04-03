import {Injectable} from '@angular/core';
import {fabric} from 'fabric';
import {ImportToolService} from './tools/import/import-tool.service';
import {SerializedCanvas} from './history/serialized-canvas';
import {DEFAULT_CONFIG, PixieConfig} from './default-settings';
import {Store} from '@ngxs/store';
import {ApplyChanges, CancelChanges, CloseEditor, OpenEditor, OpenPanel, ResetToolState} from './state/editor-state-actions';
import {delay, startWith} from 'rxjs/operators';
import {OpenSampleImagePanelService} from '../image-editor-ui/panels/open-sample-image-panel/open-sample-image-panel.service';
import {HistoryToolService} from './history/history-tool.service';
import {DrawerName} from '../image-editor-ui/toolbar-controls/drawers/drawer-name.enum';
import {EditorState} from './state/editor-state';
import {IEvent, Image} from 'fabric/fabric-impl';
import {CanvasService} from './canvas/canvas.service';
import {Toast, ToastConfig} from '@common/core/ui/toast.service';
import {EditorControlsService} from '../image-editor-ui/toolbar-controls/editor-controls.service';
import {Settings} from '@common/core/config/settings.service';
import * as Dot from 'dot-object';
import merge from 'deepmerge';
import {HttpClient} from '@angular/common/http';
import {lowerFirst} from '@common/core/utils/lower-first';
import {ToolsService} from './tools/tools.service';
import {ThemeService} from '@common/core/theme.service';
import { CanvasStateService } from './canvas/canvas-state.service';
import { ActiveObjectService } from './canvas/active-object/active-object.service';
import { TextToolService } from './tools/text/text-tool.service';
import { FloatingPanelsService } from 'app/image-editor-ui/toolbar-controls/floating-panels.service';
import { objectToArray } from '@common/core/utils/object-to-array';

/**
 * This class should not be imported into any other tools or services.
 */
@Injectable({
    providedIn: 'root'
})
export class ImageEditorService {
    constructor(
        protected importTool: ImportToolService,
        protected canvas: CanvasService,
        protected history: HistoryToolService,
        protected store: Store,
        protected state: CanvasStateService,
        protected openSampleImagePanel: OpenSampleImagePanelService,
        protected toast: Toast,
        protected editorControls: EditorControlsService,
        protected settings: Settings,
        protected httpClient: HttpClient,
        protected tools: ToolsService,
        protected themes: ThemeService,
        protected activeObject: ActiveObjectService,
        protected textTool: TextToolService,
        protected panels: FloatingPanelsService
    ) {}

    /**
     * Open specified image and then editor.
     */
    public openEditorWithImage(data: string|HTMLImageElement, asMainImage: boolean = true) {
        this.openFile(data, 'png', asMainImage).then(() => this.open());
    }

    /**
     * Open specified photo as main canvas image.
     */
    public openMainImage(data: string|HTMLImageElement) {
        this.openFile(data, 'png', true);
    }

    public openFile(data: string|HTMLImageElement, extension: string = 'png', asMainImage: boolean = false, name: string = "") {
        return asMainImage ?
            this.importTool.openBackgroundImage(data) :
            this.importTool.openFile(data, extension, false, name);
    }

    public newCanvas(width: number, height: number, projectId:number, userId:number) {
        this.state.canvasId = projectId;
        this.state.userId = userId;
        this.state.pages = this.canvas.loadPages();
        this.state.library = this.canvas.loadLibrary();
        this.state.canvasObjects = [];
        this.state.activeTool = "";
        return this.canvas.openNew(width, height);
    }

    //TODO: on addPart, allow user to click through part stuff, load in div automatically once they're done, allow the user to resize and position
    //TODO: make a panel that contains "Add Part" and "Cancel"
    public loadPlaceholder() {
        this.panels.openAddPartPanel();
        let objects = this.canvas.fabric().getObjects();
        let hasPlaceholder = false;
        objects.map(object => {
            if (object.name == "Placeholder Div") {
                hasPlaceholder = true;
            }
        });
        const currentObject = this.activeObject.get();
        if (currentObject == null && hasPlaceholder == false) {
            let phWidth = this.canvas.fabric().width *.20;
            let phHeight = this.canvas.fabric().height *.20;

           let placeholder = new fabric.Rect({
                width: phWidth,
                height: phHeight,
                objectCaching: true,
                fill: 'transparent',
                name: 'Placeholder Div',
                stroke: '#bf202f',
                strokeWidth: 1,
                strokeDashArray: [2,2],
                selectable: true,
                evented: true,
                lockUniScaling:false
            });
    
            this.state.fabric.add(placeholder);
            placeholder.viewportCenter();
            this.canvas.fabric().setActiveObject(placeholder);
            placeholder.setCoords();
            this.canvas.render();
        }
    }


    public addPart(part) {
        let objects = this.canvas.fabric().getObjects();
        let placeholderObj = null;
        let maxWidth  = this.state.original.width;
        let maxHeight = this.state.original.height;

        objects.map(object => {
            if (object.name == "Placeholder Div") {
                placeholderObj = object;
            }
        });

        if (placeholderObj != null) {
            maxWidth  = placeholderObj.width * placeholderObj.scaleX,
            maxHeight = placeholderObj.height * placeholderObj.scaleY;

            console.log(maxWidth);
            console.log(maxHeight);

            let halfWidth = maxWidth / 2 
            let placeholderX = placeholderObj.left;
            let placeholderY = placeholderObj.top;
            let name = "Part " + part.PartNumber;

            let quadrants = [
                {position:"topL", width:halfWidth, height:(.20 * maxHeight), positionX:placeholderX, positionY:placeholderY, data:[part.BrandImage], name:name + " - Brand Image", type:'image'}, 
                {position:"topR", width:halfWidth, height:(.20 * maxHeight), positionX:(placeholderX + halfWidth), positionY:placeholderY, data:[part.Name], name:name + " - Part Name", type:'text'},
                {position:"midL", width:halfWidth, height:(.60 * maxHeight), positionX:placeholderX, positionY:(placeholderY + (.20 * maxHeight)), data:part.Images, name:name + " - Part Image", type:"image"}, 
                {position:"midR", width:halfWidth, height:(.60 * maxHeight), positionX:(placeholderX + halfWidth), positionY:(placeholderY + (.20 * maxHeight)), data:part.Descriptions, name:name + " - Part Description", type:"text"},
                {position:"botL", width:halfWidth, height:(.20 * maxHeight), positionX:placeholderX, positionY:(placeholderY + (.60 * maxHeight)), data:[part.PartNumber], name:name + " - Part Number", type:"text"}, 
                {position:"botR", width:halfWidth, height:(.20 * maxHeight), positionX:(placeholderX + halfWidth), positionY:(placeholderY + (.60 * maxHeight)), data:[part.Price], name:name + " - Price", type:"text"},
            ]

            quadrants.map(quadrant => {
                if (quadrant.type == "image") {
                    this.canvas.openPartImages(quadrant);
                } else if (quadrant.type == "text") {
                    this.textTool.addPartText(quadrant);
                }
            });
        } else {
            //add as normal, might just... leave this out lol
        }
        this.panels.closePanel('add-part');
        this.canvas.fabric().setActiveObject(placeholderObj);
        this.activeObject.delete();
    }

    /**
     * Load canvas state from specified json data or url.
     */
    public loadState(stateOrUrl: string|SerializedCanvas, projectGroupId:number, projectId:number, userId:number) {
        this.state.groupId = projectGroupId;
        this.state.canvasId = projectId;
        this.state.userId = userId;
        this.state.pages = this.canvas.loadPages();
        this.state.library = this.canvas.loadLibrary();
        this.state.canvasObjects = [];
        this.state.activeTool = "";
        this.state.action = "setting";

        if (typeof stateOrUrl === 'string' && (stateOrUrl.endsWith('.json') || stateOrUrl.startsWith('http'))) {
            return this.importTool.loadStateFromUrl(stateOrUrl);
        } else {
            return this.importTool.loadState(stateOrUrl);
        }
    }

    /**
     * Get current canvas state as json string.
     */
    public getState(customProps?: string[]) {
        return JSON.stringify(this.history.getCurrentCanvasState(customProps));
    }

    /**
     * Open editor if it's currently closed.
     * New configuration can also be optionally specified.
     */
    public open(config?: PixieConfig) {
        if (config) {
            this.setConfig(config);
        }
        this.store.dispatch(new OpenEditor()).pipe(delay(1)).subscribe(() => {
            this.canvas.zoom.fitToScreen();
            this.openSampleImagePanel.open();
            this.history.addInitial();
        });
    }

    /**
     * Close editor if it's currently open.
     */
    public close() {
        return this.store.dispatch(new CloseEditor());
    }

    /**
     * Apply any pending changes from currently open or specified panel.
     * This is identical to clicking "apply" button in the editor.
     */
    public applyChanges(panel?: DrawerName) {
        let action = true;
        if (this.state.action == 'removing') {
            action = false;
        }
        this.state.canvasObjects.map(object => {
            if (object.id == this.activeObject.getId()) {
                switch(this.state.activeTool) {
                    case 'outline':
                        object.outline = action;
                        break;
                    case 'shadow':
                        object.shadow = action;
                        break;
                    case 'background':
                        object.background = action;
                        break;
                    case 'opacity':
                        object.opacity = action;
                        break;
                    case 'texture':
                        object.texture = action;
                        break;
                    case 'gradient':
                        object.gradient = action;
                        break;      
                }
            }
        });
        panel = panel || this.store.selectSnapshot(EditorState.activePanel) || DrawerName.OBJECT_SETTINGS;
        this.store.dispatch(new ApplyChanges(panel));
        // console.log(this.state.canvasObjects);
    }

    /**
     * Cancel any pending changes from currently open or specified panel.
     * This is identical to clicking "cancel" button in the editor.
     */
    public cancelChanges(panel?: DrawerName) {
        panel = panel || this.store.selectSnapshot(EditorState.activePanel) || DrawerName.OBJECT_SETTINGS;
        this.store.dispatch(new CancelChanges(panel));
    }

    /**
     * Open specified editor panel.
     * (Filter, crop, resize etc.)
     */
    public openPanel(name: DrawerName) {
        this.store.dispatch(new OpenPanel(name));
    }

    /**
     * Listen to specified canvas event.
     * (List of all available events can be found in the documentation)
     */
    public on(event: string, callback: (e: IEvent) => void) {
        return this.canvas.fabric().on(event, callback);
        // console.log(event);
    }

    /**
     * Check if some modifications were made to image,
     * but "apply" button was not clicked yet.
     */
    public isDirty() {
        return this.store.selectSnapshot(EditorState.dirty);
    }

    /**
     * Get tool by specified name.
     */
    public getTool(name: string) {
        return this.tools.get(name);
    }

    /**
     * Get tool by specified name.
     */
    public get(name: string) {
        return this.getTool(name);
    }

    /**
     * Display specified notification message on the screen.
     */
    public notify(message: string, config?: ToastConfig) {
        return this.toast.open(message, config);
    }

    /**
     * Fully reset editor and canvas state and
     * optionally override specified configuration.
     */
    public resetEditor(key: string|PixieConfig, value?: any) {
        return new Promise(resolve => {
            // reset fabric and UI
            this.importTool.resetEditor();

            // set new config, if provided
            if (key) this.setConfig(key, value);

            this.store.dispatch(new ResetToolState());

            // re-init canvas
            this.loadInitialContent().then(() => {
                this.editorControls.closeCurrentPanel();
                this.openSampleImagePanel.open();
                if (key) {
                    this.history.addInitial();
                }
                resolve();
            });
        });
    }

    /**
     * Fully reset and open editor.
     */
    public resetAndOpenEditor(key: string|PixieConfig, value?: any) {
        return this.resetEditor(key, value).then(() => this.open());
    }

    /**
     * Override specified configuration.
     * Accepts configuration object or key value pair using dot notation.
     */
    public setConfig(key: string|PixieConfig, value?: any) {
        // set config if key and value is provided
        if (typeof key === 'string' && typeof value !== 'undefined') {
            const prefixedKey = key.indexOf('vebto.') > -1 ? key : 'pixie.' + key;
            this.settings.set(prefixedKey, value);

            // set config if config object is provided
        } else if (typeof key === 'object') {
            const config = {pixie: key};

            if (config.pixie['sentry_public']) {
                this.settings.set('logging.sentry_public', config.pixie['sentry_public']);
            }
            this.settings.merge(config);
        }
    }

    /**
     * Get default configuration without any custom overrides.
     */
    public getDefaultConfig(key: string): any {
        return Dot.pick(key, DEFAULT_CONFIG);
    }

    /**
     * Get built in http service for making http requests.
     */
    public http(): HttpClient {
        return this.httpClient;
    }

    /**
     * @hidden
     */
    public loadInitialContent(): Promise<Image|{width: number, height: number}|void> {
        let image = this.settings.get('pixie.image');
        if (image instanceof HTMLImageElement) image = image.src;
        const size = this.settings.get('pixie.blankCanvasSize'),
            state = this.settings.get('pixie.state');
        if (image) {
            if (image.endsWith('.json')) {
                return this.loadState(image, 0, 0, 0);
            } else {
                return this.canvas.loadMainImage(image);
            }
        } else if (state) {
            return this.loadState(state, 0, 0, 0);
        } else if (size) {
            return this.canvas.openNew(size.width, size.height);
        }
        return new Promise(resolve => resolve());
    }

    public getTracked() {
        return this.state.canvasObjects;
    }

    /**
     * @hidden
     */
    public static mergeConfig(userConfig: PixieConfig) {
        const merged = merge(DEFAULT_CONFIG, userConfig || {});
        return ImageEditorService.replaceDefaultConfigItems(merged, userConfig);
    }

    /**
     * Remove default items if "replaceDefault" is true in user config.
     * @hidden
     */
    public static replaceDefaultConfigItems(config: object, userConfig: object) {
        for (const key in config) {
            if (key.startsWith('replaceDefault') && config[key]) {
                // "replaceDefaultSamples" => "samples" or just "items"
                const iterablesKey = lowerFirst((key.replace('replaceDefault', '') || 'items'));
                config[iterablesKey] = userConfig ? userConfig[iterablesKey] : [];
            } else if (typeof config[key] === 'object') {
                ImageEditorService.replaceDefaultConfigItems(config[key], userConfig && userConfig[key]);
            }
        }

        return config;
    }
}
