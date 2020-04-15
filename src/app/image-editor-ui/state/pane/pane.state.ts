import {Action, Actions, NgxsOnInit, Selector, State, StateContext, Store} from '@ngxs/store';
import {HistoryToolService} from '../../../image-editor/history/history-tool.service';
import {CloseForePanel, OpenPanel} from '../../../image-editor/state/editor-state-actions';
import {BaseToolState} from '../base-tool.state';
import {DrawerName} from '../../toolbar-controls/drawers/drawer-name.enum';


interface PaneStateModel {
    dirty: boolean;
    showApply:boolean
    // activeCategory: StickerCategory;
}

const PANE_STATE_DEFAULTS = {
    dirty: true,
    showApply:false
    // activeCategory: null,
};

@State<PaneStateModel>({
    name: 'pane',
    defaults: PANE_STATE_DEFAULTS
})
export class PaneState extends BaseToolState<PaneStateModel> implements NgxsOnInit {
    protected toolName = DrawerName.PANE;

    @Selector()
    static dirty(state: PaneStateModel) {
        return state.dirty;
    }

    @Selector()
    static showApply(state: PaneStateModel) {
        return state.showApply;
    }

    constructor(
        protected store: Store,
        protected history: HistoryToolService,
        protected actions$: Actions,
    ) {
        super();
    }

    applyChanges(ctx: StateContext<PaneStateModel>) {
        this.store.dispatch(new OpenPanel(DrawerName.OBJECT_SETTINGS));
        if (ctx.getState().dirty) {
            // this.history.add(HistoryNames.PROJECTS);
        }
        // ctx.patchState(PROJECT_STATE_DEFAULTS);
    }

    cancelChanges(ctx: StateContext<PaneStateModel>) {
        this.store.dispatch(new CloseForePanel());
        ctx.patchState(PANE_STATE_DEFAULTS);
    }

    resetState(ctx: StateContext<PaneStateModel>) {
        ctx.setState(PANE_STATE_DEFAULTS);
    }
}
