import { Component, OnInit } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService } from '../alert.service';
import { AppService } from '../app-service.service';
import { LoaderService } from '../loader.service';
import { NotificationsService } from 'angular2-notifications';
import { environment } from '../../environments/environment';

@Component({
    selector: 'app-callback',
    templateUrl: './callback.component.html',
    styleUrls: ['./callback.component.scss']
})
export class CallbackComponent implements OnInit {

    httpOptions: RequestOptions;

    constructor(private http: Http, private router: Router, private route: ActivatedRoute, private _appService: AppService,
        private loadingService: LoaderService, private alertService: AlertService, private notify: NotificationsService) { }

    ngOnInit() {
        this.httpOptions = new RequestOptions({ withCredentials: true });

        this.loadingService.show('Please wait...');

        this.route.params.subscribe(params => {

            this.route.queryParams.subscribe(params => {
                var data = {
                    state: params.state,
                    code: params.code
                }
                const projectId = JSON.parse(decodeURIComponent(params.state)).projectId;

                this.http.post(environment.oclaviServer + 'gdrive/callback', data, this.httpOptions)
                    .subscribe((res: any) => {
                        const user = JSON.parse(localStorage.getItem('user'));
                        user.PROJECTS[projectId].STORAGE_DETAILS = res.json().storage_details;
                        localStorage.setItem('user', JSON.stringify(user));

                        this.loadingService.hide();
                        this.notify.success('Your google drive account has been connected.');

                        this.router.navigate([`profile/projects/${projectId}`]);

                    }, err => {
                        this.errorHandler(err, 'Error connecting your google drive account.');
                    });
            });
        });
    }

    errorHandler(response, message) {
        //general purpose error handler
        this.loadingService.hide();

        if (response.status == 401)
            this.router.navigate(['login']);

        else {
            var text = JSON.parse(response._body).message;

            if (text != '')
                this.alertService.show('error', text);

            else
                this.notify.error(null, message);
        }
    }
}
