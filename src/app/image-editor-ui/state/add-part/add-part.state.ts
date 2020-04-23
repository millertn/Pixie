import {Action, Actions, NgxsOnInit, Selector, State, StateContext, Store} from '@ngxs/store';
import {HistoryToolService} from '../../../image-editor/history/history-tool.service';
import {CloseForePanel, OpenPanel} from '../../../image-editor/state/editor-state-actions';
import {BaseToolState} from '../base-tool.state';
import {DrawerName} from '../../toolbar-controls/drawers/drawer-name.enum';


interface AddPartStateModel {
    dirty: boolean;
    showApply:boolean
    // activeCategory: StickerCategory;
}

const ADD_PART_STATE_DEFAULTS = {
    dirty: true,
    showApply:false
    // activeCategory: null,
};

@State<AddPartStateModel>({
    name: 'addpart',
    defaults: ADD_PART_STATE_DEFAULTS
})
export class AddPartState extends BaseToolState<AddPartStateModel> implements NgxsOnInit {
    protected toolName = DrawerName.ADDPART;

    @Selector()
    static dirty(state: AddPartStateModel) {
        return state.dirty;
    }

    @Selector()
    static showApply(state: AddPartStateModel) {
        return state.showApply;
    }

    constructor(
        protected store: Store,
        protected history: HistoryToolService,
        protected actions$: Actions,
    ) {
        super();
    }

    applyChanges(ctx: StateContext<AddPartStateModel>) {
        this.store.dispatch(new OpenPanel(DrawerName.OBJECT_SETTINGS));
        if (ctx.getState().dirty) {
            // this.history.add(HistoryNames.PROJECTS);
        }
        // ctx.patchState(PROJECT_STATE_DEFAULTS);
    }

    cancelChanges(ctx: StateContext<AddPartStateModel>) {
        this.store.dispatch(new CloseForePanel());
        ctx.patchState(ADD_PART_STATE_DEFAULTS);
    }

    resetState(ctx: StateContext<AddPartStateModel>) {
        ctx.setState(ADD_PART_STATE_DEFAULTS);
    }
}
