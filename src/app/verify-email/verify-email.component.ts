import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService } from '../alert.service';
import { AppService } from '../app-service.service';
import { LoaderService } from '../loader.service';
import { LoggerService } from '../logger.service';
import { NotificationsService } from 'angular2-notifications';
import { environment } from '../../environments/environment';

@Component({
    selector: 'app-verify-email',
    templateUrl: './verify-email.component.html',
    styleUrls: ['./verify-email.component.scss']
})
export class VerifyEmailComponent implements OnInit {

    httpOptions: any;

    constructor(private http: Http, private router: Router, private route: ActivatedRoute, private _appService: AppService,
        private loadingService: LoaderService, private loggerService: LoggerService, private alertService: AlertService, private notify: NotificationsService) { }

    ngOnInit() {
        this.loadingService.show('Verifying your email address');
        this.httpOptions = new RequestOptions({ withCredentials: true });

        this.route.params.subscribe(params => {
            var data = {
                userType: params['userType'],
                verifyToken: params['verifyToken'],
                permalink: params['permalink']
            }

            this.http.post(environment.oclaviServer + 'verify', data, this.httpOptions).subscribe(res => {
                this.loadingService.hide();
                this.notify.success('Your email has been verified.');
                if(data.userType == 'freelancer') {
                     this.router.navigate(['/freelancer/login']);
                } else {
                 this.router.navigate(['/login']);
                }
               
            }, (err) => {
                this.loadingService.hide();

                var body = JSON.parse(err._body);

                if (body.message != '')
                    this.notify.error(body.message);

                else
                    this.notify.error('Error verifying your email address.');
            });
        });
    }

}
