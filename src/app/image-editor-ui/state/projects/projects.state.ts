import {Action, Actions, NgxsOnInit, Selector, State, StateContext, Store} from '@ngxs/store';
import {HistoryToolService} from '../../../image-editor/history/history-tool.service';
import {CloseForePanel, OpenPanel} from '../../../image-editor/state/editor-state-actions';
import {HistoryNames} from '../../../image-editor/history/history-names.enum';
// import {MarkAsDirty, OpenStickerCategory} from './stickers.actions';
import {BaseToolState} from '../base-tool.state';
import {DrawerName} from '../../toolbar-controls/drawers/drawer-name.enum';
// import {StickerCategory} from '../../../image-editor/tools/shapes/default-stickers';

interface ProjectsStateModel {
    dirty: boolean;
    showApply:boolean
    // activeCategory: StickerCategory;
}

const PROJECTS_STATE_DEFAULTS = {
    dirty: true,
    showApply:false
    // activeCategory: null,
};

@State<ProjectsStateModel>({
    name: 'projects',
    defaults: PROJECTS_STATE_DEFAULTS
})
export class ProjectsState extends BaseToolState<ProjectsStateModel> implements NgxsOnInit {
    protected toolName = DrawerName.PROJECTS;

    @Selector()
    static dirty(state: ProjectsStateModel) {
        return state.dirty;
    }

    @Selector()
    static showApply(state: ProjectsStateModel) {
        return state.showApply;
    }

    // @Selector()
    // static activeCategory(state: ProjectsStateModel) {
    //     return state.activeCategory;
    // }

    constructor(
        protected store: Store,
        protected history: HistoryToolService,
        protected actions$: Actions,
    ) {
        super();
    }

    // @Action(MarkAsDirty)
    // markAsDirty(ctx: StateContext<StickersStateModel>) {
    //     ctx.patchState({dirty: true});
    // }

    // @Action(OpenStickerCategory)
    // openStickerCategory(ctx: StateContext<StickersStateModel>, action: OpenStickerCategory) {
    //     ctx.patchState({activeCategory: action.category});
    // }

    applyChanges(ctx: StateContext<ProjectsStateModel>) {
        this.store.dispatch(new OpenPanel(DrawerName.OBJECT_SETTINGS));
        if (ctx.getState().dirty) {
            // this.history.add(HistoryNames.PROJECTS);
        }
        // ctx.patchState(PROJECT_STATE_DEFAULTS);
    }

    cancelChanges(ctx: StateContext<ProjectsStateModel>) {
        // if ( ! ctx.getState().activeCategory) {
            this.store.dispatch(new CloseForePanel());
        // }
        // if (ctx.getState().dirty) {
        //     this.history.reload();
        // }
        ctx.patchState(PROJECTS_STATE_DEFAULTS);
    }

    resetState(ctx: StateContext<ProjectsStateModel>) {
        ctx.setState(PROJECTS_STATE_DEFAULTS);
    }
}
