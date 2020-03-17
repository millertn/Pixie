import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {Settings} from 'common/core/config/settings.service';
import {Select, Store} from '@ngxs/store';
import {ProjectsState} from '../../../state/projects/projects.state';
import {Observable} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ImportToolService } from 'app/image-editor/tools/import/import-tool.service';

@Component({
    selector: 'pages-drawer',
    templateUrl: './pages-drawer-component.html',
    styleUrls: ['./pages-drawer-component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {'class': 'controls-drawer'},
})
export class PagesDrawerComponent {
    public pages:[Object];
    constructor(
        private http:HttpClient,

    ) {
        this.http.get("https://theaamgroup.com/image-editor/test", {
            headers: {'Access-Control-Allow-Origin': "*"}
        }).subscribe(data => {
            for (let page in data) {
                console.log(data[page]);
            }
            console.log(data);
        }, err => {
            console.log(err);
        });
    }
}