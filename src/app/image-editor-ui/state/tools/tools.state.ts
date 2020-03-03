import {Action, Actions, NgxsOnInit, Selector, State, StateContext, Store} from '@ngxs/store';
import {HistoryToolService} from '../../../image-editor/history/history-tool.service';
import {CloseForePanel, OpenPanel} from '../../../image-editor/state/editor-state-actions';
import {BaseToolState} from '../base-tool.state';
import {DrawerName} from '../../toolbar-controls/drawers/drawer-name.enum';

interface ToolsStateModel {
}

const TOOLS_STATE_DEFAULTS = {
    dirty: true,
    showApply:false
};

@State<ToolsStateModel>({
    name: 'tools',
    defaults: TOOLS_STATE_DEFAULTS
})
export class ToolsState extends BaseToolState<ToolsStateModel> implements NgxsOnInit {
    protected toolName = DrawerName.TOOLS;

    constructor(
        protected store: Store,
        protected history: HistoryToolService,
        protected actions$: Actions,
    ) {
        super();
    }

    applyChanges(ctx: StateContext<ToolsStateModel>) {
        this.store.dispatch(new OpenPanel(DrawerName.OBJECT_SETTINGS));
        // if (ctx.getState().dirty) {
            // this.history.add(HistoryNames.PROJECTS);
        // }
        // ctx.patchState(PROJECT_STATE_DEFAULTS);
    }

    cancelChanges(ctx: StateContext<ToolsStateModel>) {
        // if ( ! ctx.getState().activeCategory) {
            this.store.dispatch(new CloseForePanel());
        // }
        // if (ctx.getState().dirty) {
        //     this.history.reload();
        // }
        ctx.patchState(TOOLS_STATE_DEFAULTS);
    }

    resetState(ctx: StateContext<ToolsStateModel>) {
        ctx.setState(TOOLS_STATE_DEFAULTS);
    }
}
