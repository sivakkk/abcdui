import { Component, OnInit, OnDestroy } from '@angular/core';
import { LoaderService } from './loader.service';
import { ConfirmPasswordService } from './confirm-password.service';
import { AlertService } from './alert.service';
import { NotificationsService } from 'angular2-notifications';
import { environment } from '../environments/environment';

declare var $: any;

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    providers: [LoaderService, AlertService]
})
export class AppComponent implements OnInit, OnDestroy {
    title = 'app';
    loaderService: LoaderService;
    confirmPasswordService: ConfirmPasswordService;
    alertService: AlertService;
    alert: Boolean;
    alertSubscription;
    confirmPasswordSubscription;

    options = {
        position: ["top", "right"],
        timeOut: 3000,
        showProgressBar: true,
        pauseOnHover: false,
        clickToClose: true,
        maxLength: 10,
        maxStack: 1
    }

    constructor(private loadingServiceInstance: LoaderService, private confirmPasswordServiceInstance: ConfirmPasswordService, private alertServiceInstance: AlertService, private _service: NotificationsService) {
        this.loaderService = loadingServiceInstance;
        this.confirmPasswordService = confirmPasswordServiceInstance;
        this.alertService = alertServiceInstance;
    }

    ngOnInit() {
        this.alertSubscription = this.alertService.alert.subscribe(isAlert => {
            if (isAlert === true) {
                $('#alertModal').modal('show');
            }
            else {
                $('#alertModal').modal('hide');
            }
        });

        this.confirmPasswordSubscription = this.confirmPasswordService.subject.subscribe(isConfirm => {
            if (isConfirm) {
                $('#confirmPasswordContent').modal('show');
            }
            else {
                $('#confirmPasswordContent').modal('hide');
            }
        });
    }

    ngOnDestroy() {
        this.alertSubscription.unsubscribe();
        this.confirmPasswordSubscription.unsubscribe();
    }
}
