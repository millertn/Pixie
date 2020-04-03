import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {Settings} from 'common/core/config/settings.service';
import {DomSanitizer, SafeStyle} from '@angular/platform-browser';
import {ActiveObjectService} from '../../../../image-editor/canvas/active-object/active-object.service';
import {FillToolService} from '../../../../image-editor/tools/fill/fill-tool.service';
import {ImportToolService} from '../../../../image-editor/tools/import/import-tool.service';
import { CanvasStateService } from 'app/image-editor/canvas/canvas-state.service';
import { EditorControlsService } from '../../editor-controls.service';
import { ImageEditorService } from 'app/image-editor/image-editor.service';

@Component({
    selector: 'texture-controls-drawer',
    templateUrl: './texture-controls-drawer.component.html',
    styleUrls: ['./texture-controls-drawer.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class TextureControlsDrawerComponent {
    public defaultTextures = Array.from(Array(28).keys());
    public currentObjectInfo: any; 

    constructor(
        public activeObject: ActiveObjectService,
        private settings: Settings,
        private sanitizer: DomSanitizer,
        private fillTool: FillToolService,
        private importTool: ImportToolService,
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

    public getTextureBgStyle(index: number): SafeStyle {
        return this.sanitizer.bypassSecurityTrustStyle(
            'url(' + this.getTextureUrl(index) + ')'
        );
    }

    private getTextureUrl(index: number): string {
        return this.settings.getAssetUrl('images/textures/' + index + '.png', true);
    }

    public fillWithPattern(index: number) {
        this.fillTool.withPattern(this.getTextureUrl(index));
    }

    public openUploadDialog() {
        this.importTool.importAndGetData().then(data => {
            this.fillTool.withPattern(data);
        });
    }

    public removeEffect() {
        this.activeObject.setValues({
            fill:'#000'
        });
        this.state.action = 'removing';
        this.imageEditor.applyChanges();
        this.editor.closeCurrentPanel();
    }
}
