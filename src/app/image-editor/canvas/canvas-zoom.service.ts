import {Injectable} from '@angular/core';
import {CanvasPanService} from './canvas-pan.service';
import {CanvasStateService} from './canvas-state.service';
import {Settings} from 'common/core/config/settings.service';
import {Store} from '@ngxs/store';
import {SetZoom} from '../state/editor-state-actions';

@Injectable()
export class CanvasZoomService {
    protected maxZoom = 200;
    protected minZoom = 10;
    protected zoomStep = 5;
    protected currentZoom = 1;

    constructor(
        private state: CanvasStateService,
        private pan: CanvasPanService,
        private config: Settings,
        private store: Store,
    ) {}

    public get() {
        return this.currentZoom;
    }

    public getScaleFactor() {
        return this.state.fabric.getZoom();
    }

    public zoomIn(amount = this.zoomStep) {
        this.set(this.currentZoom + amount);
    }

    public canZoomIn(amount = this.zoomStep): boolean {
        return (this.currentZoom + amount) <= this.maxZoom;
    }

    public canZoomOut(amount = this.zoomStep): boolean {
        return (this.currentZoom - amount) >= this.minZoom;
    }

    public zoomOut(amount = this.zoomStep) {
        this.set(this.currentZoom - amount);
    }

    /**
     * Zoom canvas to specified scale.
     */
    public set(zoomPercentage: number, resize: boolean = true) {
        zoomPercentage = Math.trunc(zoomPercentage); // remove any decimals integer might have
        if (zoomPercentage < this.minZoom || zoomPercentage > this.maxZoom) return;
        const fabricZoomFactor = zoomPercentage / 100;

        const width = this.state.original.width * fabricZoomFactor,
            height = this.state.original.height * fabricZoomFactor;

        this.state.fabric.setZoom(fabricZoomFactor);

        if (resize) {
            this.state.fabric.setHeight(height);
            this.state.fabric.setWidth(width);
        }

        this.currentZoom = zoomPercentage;
        this.store.dispatch(new SetZoom(this.currentZoom));
    }

    /**
     * Resize canvas to fit available screen space.
     */
    public fitToScreen() {
        if ( ! this.config.get('pixie.tools.zoom.fitImageToScreen')) return;
        const size = this.state.calcWrapperSize();

        const maxWidth = size.width - 40, maxHeight = size.height - 40;

        if (this.state.original.height > maxHeight || this.state.original.width > maxWidth) {
            const scale = Math.min(maxHeight / this.state.original.height, maxWidth / this.state.original.width);
            // no need to allow zooming out beyond maximum size that fits into canvas
            this.minZoom = Math.trunc(scale * 100);
            this.set(scale * 100);
        }
    }

    public init() {
        if ( ! this.config.get('pixie.tools.zoom.allowUserZoom')) return;
        this.bindMouseWheel();
        this.bindToPinchZoom();
    }

    private bindMouseWheel() {
        this.state.fabric.on('mouse:wheel', opt => {
            opt.e.preventDefault();
            opt.e.stopPropagation();

            if (opt.e.deltaY < 0) {
                this.zoomIn();
            } else {
                this.zoomOut();
            }

            this.pan.set();
            this.state.fabric.requestRenderAll();
        });
    }

    /**
     * Resize canvas when pinch zooming on mobile.
     */
    private bindToPinchZoom() {
        const mc = new Hammer.Manager(this.state.maskWrapperEl);
        const pinch = new Hammer.Pinch();
        mc.add([pinch]);

        mc.on('pinch', (ev: HammerInput) => {
            const step = Math.abs(ev['overallVelocity']);

            if (ev['additionalEvent'] === 'pinchout') {
                this.zoomIn(step);
            } else {
                this.zoomOut(step);
            }

            this.pan.set();
            this.state.fabric.requestRenderAll();
        });
    }
}
