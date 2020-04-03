import {Action, Actions, NgxsOnInit, Selector, State, StateContext, Store} from '@ngxs/store';
import {MarkAsDirty, OpenObjectSettingsPanel} from './objects.actions';
import {CloseForePanel} from '../../../image-editor/state/editor-state-actions';
import {ActiveObjectService} from '../../../image-editor/canvas/active-object/active-object.service';
import {HistoryToolService} from '../../../image-editor/history/history-tool.service';
import {HistoryNames} from '../../../image-editor/history/history-names.enum';
import {BaseToolState} from '../base-tool.state';
import {DrawerName} from '../../toolbar-controls/drawers/drawer-name.enum';
import { CanvasStateService } from 'app/image-editor/canvas/canvas-state.service';
export interface ObjectsStateModel {
    dirty: boolean;
    activePanel: string;
    activeTool:string;
}

@State<ObjectsStateModel>({
    name: DrawerName.OBJECT_SETTINGS,
    defaults: {
        dirty: false,
        activePanel: null,
        activeTool:""
    }
})
export class ObjectsState extends BaseToolState<ObjectsStateModel> implements NgxsOnInit {
    protected toolName = DrawerName.OBJECT_SETTINGS;

    @Selector()
    static dirty(state: ObjectsStateModel) {
        return state.dirty;
    }

    @Selector()
    static activePanel(state: ObjectsStateModel) {
        return state.activePanel;
    }

    @Selector()
    static activeTool(state: ObjectsStateModel) {
        return state.activeTool;
    }

    constructor(
        protected store: Store,
        protected history: HistoryToolService,
        protected activeObject: ActiveObjectService,
        protected actions$: Actions,
        private state: CanvasStateService
    ) {
        super();
    }

    @Action(OpenObjectSettingsPanel)
    openObjectSettingsPanel(ctx: StateContext<ObjectsStateModel>, action: OpenObjectSettingsPanel) {
        ctx.patchState({activePanel: action.panel, activeTool:action.panel});
    }

    @Action(MarkAsDirty)
    markAsDirty(ctx: StateContext<ObjectsStateModel>) {
        ctx.patchState({dirty: true});
    }

    cancelChanges(ctx: StateContext<ObjectsStateModel>) {
        if (ctx.getState().activePanel) {
            ctx.patchState({activePanel: null, activeTool:""});
        } else {
            this.store.dispatch(new CloseForePanel());
            this.activeObject.deselect();
        }

        if (ctx.getState().dirty) {
            this.history.reload();
        }
        ctx.patchState({dirty: false});
    }

    applyChanges(ctx: StateContext<ObjectsStateModel>) {
        this.store.dispatch(new CloseForePanel());
        if (ctx.getState().dirty) {
            this.history.add(HistoryNames.OBJECT_STYLE);
            this.state.canvasObjects.map(object => {
                if(this.activeObject.getId() == object.id) {
                    let prop = ctx.getState().activeTool;
                    object.prop = true;
                }
            })
        }
        ctx.patchState({dirty: false, activePanel: null});
        this.activeObject.deselect();

        console.log(this.state.canvasObjects);
    }

    resetState(ctx: StateContext<ObjectsStateModel>) {
        ctx.setState({
            dirty: false,
            activePanel: null,
            activeTool:""
        });
    }
}
