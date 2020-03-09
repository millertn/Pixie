import {Action, Actions, NgxsOnInit, Selector, State, StateContext, Store} from '@ngxs/store';
import {HistoryToolService} from '../../../image-editor/history/history-tool.service';
import {CloseForePanel, OpenPanel} from '../../../image-editor/state/editor-state-actions';
import {BaseToolState} from '../base-tool.state';
import {DrawerName} from '../../toolbar-controls/drawers/drawer-name.enum';

interface WarningsStateModel {
}

const WARNINGS_STATE_DEFAULTS = {
    dirty: true,
    showApply:false
};

@State<WarningsStateModel>({
    name: 'warnings',
    defaults: WARNINGS_STATE_DEFAULTS
})
export class WarningsState extends BaseToolState<WarningsStateModel> implements NgxsOnInit {
    protected toolName = DrawerName.WARNINGS;

    constructor(
        protected store: Store,
        protected history: HistoryToolService,
        protected actions$: Actions,
    ) {
        super();
    }

    applyChanges(ctx: StateContext<WarningsStateModel>) {
        this.store.dispatch(new OpenPanel(DrawerName.OBJECT_SETTINGS));
        // if (ctx.getState().dirty) {
            // this.history.add(HistoryNames.PROJECTS);
        // }
        // ctx.patchState(PROJECT_STATE_DEFAULTS);
    }

    cancelChanges(ctx: StateContext<WarningsStateModel>) {
        // if ( ! ctx.getState().activeCategory) {
            this.store.dispatch(new CloseForePanel());
        // }
        // if (ctx.getState().dirty) {
        //     this.history.reload();
        // }
        ctx.patchState(WARNINGS_STATE_DEFAULTS);
    }

    resetState(ctx: StateContext<WarningsStateModel>) {
        ctx.setState(WARNINGS_STATE_DEFAULTS);
    }
}
