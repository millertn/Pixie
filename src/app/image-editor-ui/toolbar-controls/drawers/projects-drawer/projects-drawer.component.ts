import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {Settings} from 'common/core/config/settings.service';
import {Project} from '../../../../image-editor/tools/projects/default-projects';
import {Select, Store} from '@ngxs/store';
import {ProjectsState} from '../../../state/projects/projects.state';
import {Observable} from 'rxjs';
// import {AddShape} from '../../../state/shapes/shapes.actions';

@Component({
    selector: 'projects-drawer',
    templateUrl: './projects-drawer.component.html',
    styleUrls: ['./projects-drawer.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {'class': 'controls-drawer'},
})
export class ProjectsDrawerComponent {
    @Select(ProjectsState.dirty) dirty$: Observable<boolean>;
    public projects: [
        {
            name: 'Logos',
            url: 'https://theaamgroup.com/logos/index',
        },
    
        {
            name: 'Readyposts',
            url: 'https://theaamgroup.com/readyposts/index',
        },
    
        {
            name: 'Rebates',
            url: 'https://theaamgroup.com/rebate-center/index',
        },
    
        {
            name: 'Vehicle Images',
            url: 'https://theaamgroup.com/vehicle-images',
        }
    ];

    constructor(
        private config: Settings,
        private store: Store,
    ) {
        console.log(this.projects);
    }

    // public addShape(shape: string) {
    //     this.store.dispatch(new AddShape(shape));
    // }
}