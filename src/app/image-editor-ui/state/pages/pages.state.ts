import {Action, Actions, NgxsOnInit, Selector, State, StateContext, Store} from '@ngxs/store';
import {HistoryToolService} from '../../../image-editor/history/history-tool.service';
import {CloseForePanel, OpenPanel} from '../../../image-editor/state/editor-state-actions';
import {BaseToolState} from '../base-tool.state';
import {DrawerName} from '../../toolbar-controls/drawers/drawer-name.enum';


interface PagesStateModel {
    dirty: boolean;
    showApply:boolean
    // activeCategory: StickerCategory;
}

const PAGES_STATE_DEFAULTS = {
    dirty: true,
    showApply:false
    // activeCategory: null,
};

@State<PagesStateModel>({
    name: 'pages',
    defaults: PAGES_STATE_DEFAULTS
})
export class PagesState extends BaseToolState<PagesStateModel> implements NgxsOnInit {
    protected toolName = DrawerName.PAGES;

    @Selector()
    static dirty(state: PagesStateModel) {
        return state.dirty;
    }

    @Selector()
    static showApply(state: PagesStateModel) {
        return state.showApply;
    }

    constructor(
        protected store: Store,
        protected history: HistoryToolService,
        protected actions$: Actions,
    ) {
        super();
    }

    applyChanges(ctx: StateContext<PagesStateModel>) {
        this.store.dispatch(new OpenPanel(DrawerName.OBJECT_SETTINGS));
        if (ctx.getState().dirty) {
            // this.history.add(HistoryNames.PROJECTS);
        }
        // ctx.patchState(PROJECT_STATE_DEFAULTS);
    }

    cancelChanges(ctx: StateContext<PagesStateModel>) {
        this.store.dispatch(new CloseForePanel());
        ctx.patchState(PAGES_STATE_DEFAULTS);
    }

    resetState(ctx: StateContext<PagesStateModel>) {
        ctx.setState(PAGES_STATE_DEFAULTS);
    }
}
