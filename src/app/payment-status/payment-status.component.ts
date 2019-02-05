import { Component, OnInit, ElementRef, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService } from '../alert.service';
import { AppService } from '../app-service.service';
import { LoaderService } from '../loader.service';
import { NotificationsService } from 'angular2-notifications';
import { environment } from '../../environments/environment';
import { ProjectService } from '../project.service';
import { Title, Meta } from '@angular/platform-browser';

declare var $: any;

@Component({
    selector: 'app-payment-status',
    templateUrl: './payment-status.component.html',
    styleUrls: ['./payment-status.component.scss']
})
export class PaymentStatusComponent implements OnInit {

    httpOptions: RequestOptions;
    session: any;

    constructor(private http: Http, private router: Router, private route: ActivatedRoute, private _appService: AppService,
        private loadingService: LoaderService, private alertService: AlertService, private notify: NotificationsService,
        meta: Meta, titleService: Title) {
    }

    ngOnInit() {
        this.loadingService.show('Processing your payment...');

        this.httpOptions = new RequestOptions({ withCredentials: true });
        this.session = JSON.parse(localStorage.getItem('user'));

        this.route.params.subscribe(params => {
            let queryParams = this.route.queryParams['_value'];
            let data = {
                params: params,
                queryParams: queryParams
            }

            if (params['type'] == 'upgrade' && params['status'] == 'cancel')
                this.paymentCancelled(data, '/profile/payment');

            else if (params['type'] == 'upgrade' && params['status'] == 'success')
                this.upgradePaymentSuccessful(data, '/profile/payment');

            else if (params['type'] == 'buyMoreSeats' && params['status'] == 'cancel')
                this.paymentCancelled(data, '/profile/invite_users');

            else if (params['type'] == 'buyMoreSeats' && params['status'] == 'success')
                this.buyMoreSeatsPaymentSuccessful(data, '/profile/invite_users');

            else if (params['type'] == 'freelancer' && params['status'] == 'cancel')
                this.paymentCancelled(data, '/profile/my_project');

            else if (params['type'] == 'freelancer' && params['status'] == 'success')
                this.freelancerPaymentSuccessful(data, '/profile/my_project');

            else
                console.error('Unknown source');
        }).unsubscribe();

        $('#buyMoreSeats').modal('hide');
        $('#upgradePaymentModal').modal('hide');
        $('#freelancerProjectPay').modal('hide');
    }

    paymentCancelled(data, navigateUrl) {
        this.notify.error('Your payment was unsuccessful');

        this.http.post(environment.oclaviServer + 'markPaymentAsFailed', data, this.httpOptions).subscribe(res => {
            this.loadingService.hide();

            this.router.navigate([ navigateUrl ]);
        }, err => {
            this.errorHandler(err, 'Error while executing the payment.');
        });
    }

    upgradePaymentSuccessful(data, navigateUrl) {
        this.notify.info('Processing your payment...');

        this.http.post(environment.oclaviServer + 'upgradeExecutePayment', data, this.httpOptions).subscribe(res => {
            this.loadingService.hide();

            this.session = res.json();

            localStorage.setItem('user', JSON.stringify(this.session));
            this.notify.success('Your subscription has been upgraded.');

            this.router.navigate([navigateUrl]);
        }, err => {
            this.errorHandler(err, 'Error while executing the payment.');
            this.paymentCancelled(data, navigateUrl);
        });
    }

    buyMoreSeatsPaymentSuccessful(data, navigateUrl) {
        this.notify.info('Processing your payment...');

        this.http.post(environment.oclaviServer + 'buyMoreSeatsExecutePayment', data, this.httpOptions).subscribe(res => {
            this.loadingService.hide();

            this.session = res.json();

            localStorage.setItem('user', JSON.stringify(this.session));
            this.notify.success('You have ' + this.session.TOTAL_SEATS_PURCHASED + ' seats now');

            this.router.navigate([navigateUrl]);
        }, err => {
            this.errorHandler(err, 'Error while executing the payment.');
            this.paymentCancelled(data, navigateUrl);
        });
    }

    freelancerPaymentSuccessful(data, navigateUrl) {
        this.notify.info('Processing your payment...');

        this.http.post(environment.oclaviServer + 'freelancerExecutePayment', data, this.httpOptions).subscribe(res => {
            this.loadingService.hide();

            this.notify.success('Your payment was successfull.');

            this.router.navigate([navigateUrl]);
        }, err => {
            this.errorHandler(err, 'Error while executing the payment.');
            this.paymentCancelled(data, navigateUrl);
        });
    }

    errorHandler(response, message) {
        //general purpose error handler
        this.loadingService.hide();

        if (typeof response['_body'] == 'string')
            response = response.json();

        if (response.statusCode == 401)
            this.router.navigate(['login']);

        else if (response && response.message)
            this.notify.error(null, response.message);

        else
            this.notify.error(null, message);
    }
}
