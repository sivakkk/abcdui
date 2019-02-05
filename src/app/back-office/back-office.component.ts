import { Component, OnInit } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { AlertService } from '../alert.service';
import { AppService } from '../app-service.service';
import { LoaderService } from '../loader.service';
import { NotificationsService } from 'angular2-notifications';
import { environment } from '../../environments/environment';
import { HttpHeaders } from '@angular/common/http';
import { Title, Meta } from '@angular/platform-browser';

declare var $: any;

@Component({
    selector: 'app-back-office',
    templateUrl: './back-office.component.html',
    styleUrls: ['./back-office.component.scss']
})
export class BackOfficeComponent implements OnInit {

    httpOptions: RequestOptions;
    loginsTodayCount: string;
    signUpsTodayCount: string;
    synchronizerUsedCount: string;
    totalUsersCountHandler: string;
    totalUsers: string;
    userSegregation: any;
    projectDetails: any;

    constructor(private http: Http, private router: Router, private route: ActivatedRoute, private appService: AppService,
        private loadingService: LoaderService, private alertService: AlertService, private notify: NotificationsService,
        meta: Meta, titleService: Title, private _location: Location) { }

    ngOnInit() {
        $('.accordion').accordion();

        this.httpOptions = new RequestOptions({ withCredentials: true });

        this.initiliseVariables();

        this.getloginsTodayCount();
        this.getSignUpsTodayCount();
        this.getUserSegregation();
        this.getSynchronizerUsedCount();
        this.getTotalUsers();
        this.getProjectDetails();
    }

    initiliseVariables () {
        this.loginsTodayCount = '-';
        this.signUpsTodayCount = '-';
        this.synchronizerUsedCount = '-';
        this.totalUsers = '-';
    }

    getloginsTodayCount() {
        this.http.get(environment.oclaviServer + 'backoffice/loginstodaycount', this.httpOptions).subscribe(res => {
            this.loginsTodayCount = res.json().count;
        }, err => {
            this.errorHandler(err, 'Error getting loginsTodayCount...');
        });
    }

    getSignUpsTodayCount() {
        this.http.get(environment.oclaviServer + 'backoffice/signupstodaycount', this.httpOptions).subscribe(res => {
            this.signUpsTodayCount = res.json().count;
        }, err => {
            this.errorHandler(err, 'Error getting loginsTodayCount...');
        });
    }

    getSynchronizerUsedCount() {
        this.http.get(environment.oclaviServer + 'backoffice/synchronizerusedcount', this.httpOptions).subscribe(res => {
            this.synchronizerUsedCount = res.json().count;
        }, err => {
            this.errorHandler(err, 'Error getting loginsTodayCount...');
        });
    }

    getUserSegregation() {
        this.http.get(environment.oclaviServer + 'backoffice/usersegregation', this.httpOptions).subscribe(res => {
            this.userSegregation = res.json();
            console.log(this.userSegregation);
        }, err => {
            this.errorHandler(err, 'Error getting totalUsersCount...');
        });
    }

    getTotalUsers() {
        this.http.get(environment.oclaviServer + 'backoffice/totaluserscount', this.httpOptions).subscribe(res => {
            this.totalUsers = res.json().count;
        }, err => {
            this.errorHandler(err, 'Error getting totalUsersCount...');
        });
    }

    getProjectDetails() {
        this.http.get(environment.oclaviServer + 'backoffice/projectdetails', this.httpOptions).subscribe(res => {
            this.projectDetails = res.json();

            console.log(this.projectDetails);
        }, err => {
            this.errorHandler(err, 'Error getting projectdetails...');
        });
    }

    errorHandler(response, message) {
        //general purpose error handler
        this.loadingService.hide();

        if (typeof response['_body'] == 'string')
            response = response.json();

        if (response.statusCode == 401)
            this.router.navigate(['login']);

        else if (Object.keys(response).length > 0) {
            var text = response.message;

            if (text != '')
                this.notify.error(null, text);

            else
                this.notify.error(null, message);
        }

        else
            this.notify.error(null, message);
    }
}
