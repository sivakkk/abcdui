import { Component, OnInit, Input, Output, ViewEncapsulation, EventEmitter, NgZone } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { Router, ActivatedRoute } from '@angular/router';
import { AppService } from '../app-service.service';
import { AlertService } from '../alert.service';
import { LoaderService } from '../loader.service';
import { LoggerService } from '../logger.service';
import { environment } from '../../environments/environment';
import { NotificationsService } from 'angular2-notifications';
import { Title } from '@angular/platform-browser';

declare var Razorpay: any;
declare var $: any;

@Component({
    selector: 'app-payment',
    templateUrl: './payment.component.html',
    styleUrls: ['./payment.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class PaymentComponent implements OnInit {
    // @Input() tab: string;
    // @Input() user;
    @Output() renewalDateUpdated: EventEmitter<any> = new EventEmitter();
    @Output() planTypeUpdated: EventEmitter<any> = new EventEmitter();

    httpOptions: RequestOptions;
    session: any;
    billingAmount: any;
    invoices: any;
    environment: any;
    subscription: any;
    isPlanActive: Boolean;
    payments: any;
    selectedDate: any;
    selectedCurrency: string;
    settingsTab: string;
    paymentMethod: string;
    step1: any;
    activeAccordion: string;
    durations:Array<any>;
    planDuration:string;
    currentInvoice = null;

    constructor(private http: Http, private router: Router, private route: ActivatedRoute,
        private _appService: AppService, private loadingService: LoaderService,
        private alertService: AlertService, private notify: NotificationsService,
        private loggerService: LoggerService, private ngZone: NgZone, private titleService: Title) { }

    ngOnInit() {
        this.titleService.setTitle('Payments and Subscription | OCLAVI');
        this.loadingService.show('Getting your payment details...');
        this.environment = environment;
        this.httpOptions = new RequestOptions({ withCredentials: true });
        this.session = JSON.parse(localStorage.getItem('user'));
        this.selectedCurrency = 'USD';
        this.paymentMethod = 'razorpay';
        this.isPlanActive = true;

        if (this.session.USER_TYPE == environment.USER_TYPE.TEAM.NAME) {
            this.router.navigate(['profile']);
        }

        if (this.session.USER_TYPE == environment.USER_TYPE.ADMIN.NAME || this.session.USER_TYPE == environment.USER_TYPE.SELF.NAME) {
            if (this.session.PLAN_END_DATE < (new Date().getTime())) {
                this.alertService.show('error', 'Your subscription has expired. Please upgrade');
                this.isPlanActive = false;
            }
        }

        this.subscription = {
            startDate: '',
            nextDueDate: '',
            subscriptionPlan: '',
            lastPaymentStatus: 'Successfull'
        }

        this.durations = [{
          durationLabel: '1 Month',
          durationValue: 1,
        }, {
          durationLabel: '3 Months',
          durationValue: 3,
        }, {
          durationLabel: '6 Months',
          durationValue: 6,
        }, {
          durationLabel: '1 Year',
          durationValue: 12,
        }]

        this.step1 = {
            step: 1,
            title: 'upgrage_plan_payment',
            content: `Payments Section`,
            class: '',
            status: 'inactive',
            methods: [{
              name: 'razorpay',
              description: 'For Indian Credit / Debit Cards'
            }, {
              name: 'paypal',
              description: 'For international cards'
            }],
            location: '',
            selectedMethod: 'razorpay'
        };

        this.http.get(environment.oclaviServer + 'subscriptionDetails', this.httpOptions).subscribe(res => {
            this.payments = res.json();

            this.loadingService.hide();
        }, err => {
            this.errorHandler(err, 'Error feteching subscription details.');
        });
    }

    durationChanged(duration) {
      this.planDuration = duration.durationValue;
    }

    cancelSubscription() {
        this.alertService.show('warn', 'Your active subscription would be cancelled.<br /><br />Are you sure you want to cancel your subscription?');

        this.alertService.positiveCallback = (() => {
            this.alertService.hide();
            this.loadingService.show('Cancelling your subscription details...');

            this.session = JSON.parse(localStorage.getItem('user'));

            this.http.post(environment.oclaviServer + 'cancelSubscription', { purpose: 'CANCEL_SUBSCRIPTION' }, this.httpOptions).subscribe(res => {
                this.notify.success('Your subscription has been successfully cancelled.');

                if (this.session.USER_TYPE == environment.USER_TYPE.ADMIN.NAME)
                    this.session.USER_TYPE = environment.USER_TYPE.STUDENT_ADMIN.NAME;

                else if (this.session.USER_TYPE == environment.USER_TYPE.SELF.NAME)
                    this.session.USER_TYPE = environment.USER_TYPE.STUDENT_SELF.NAME;

                this.session.STATUS = 'PENDING_FOR_CANCELLATION';

                localStorage.setItem('user', JSON.stringify(this.session));

                this.planTypeUpdated.emit(this.session.USER_TYPE);

                this.loadingService.hide();
            }, err => {
                this.errorHandler(err, 'Error cancelling your subscription.');
            });
        });
    }

    openModal(id) {
        for (let i = 1; i <= 1; i++) {
            if (i === 1) {
                this['step' + i].status = 'active';
                this['step' + i].class = 'show';
                this.activeAccordion = this['step' + i].title.replace(/_/g, ' ');
            } else {
                this['step' + i].status = 'inactive';
                this['step' + i].class = '';
            }
        }
        $('#' + id).modal(open);
    }

    payNow(vm, paymentMethod) {
        $('#upgradePaymentModal').modal('hide');

        if (paymentMethod == 'paypal')
            vm.paypalCheckout(vm);

        else if (paymentMethod == 'razorpay')
            vm.razorpayCheckout(vm);
    }

    changeSettingsTab(tab) {
        this.settingsTab = tab;
    }

    showPaymentModal() {
        if(!this.planDuration || this.planDuration == '') {
            this.notify.error('Please select plan duration.');
            return;
        }

        this.loadingService.show('Loading payment information. Please wait...');

        this.http.post(environment.oclaviServer + 'getBillingAmount', { type: 'upgrade', planDuration: this.planDuration }, this.httpOptions).subscribe(res => {
            this.loadingService.hide();

            this.openModal('upgradePaymentModal');

            this.billingAmount = res.json();
            this.billingAmount.planEndDate += ((new Date()).getTimezoneOffset() * 60 * 1000);
        }, err => {
            this.errorHandler(err, 'Error upgrading your subscription.');
        });
    }

    razorpayCheckout(vm) {
        vm.http.post(environment.oclaviServer + 'razorpay/getModalData', { type: 'upgrade', planDuration: this.planDuration }, vm.httpOptions).subscribe(res => {
            vm.loadingService.hide();
            let data = res.json();

            if(data.AMOUNT < 100)
              data.AMOUNT = 100;

            var options = {
                key: data.KEY,
                name: data.MERCHANT_NAME,
                amount: data.AMOUNT,
                description: data.DESCRIPTION,
                image: '../assets/images/Oclavi_Logo@2x.png',
                prefill: {
                    name: data.EMAIL_ID,
                    email: data.EMAIL_ID
                },
                theme: {
                    color: '#3D78E0'
                },
                handler: (response) => {
                    vm.ngZone.run(() => {
                        data.PAYMENT_ID = response.razorpay_payment_id;
                        data.PAYMENT_SOURCE = 'RAZOR_PAY';
                        data.PLAN_START_DATE = vm.billingAmount.planStartDate;
                        data.PLAN_END_DATE = vm.billingAmount.planEndDate;

                        vm.http.post(environment.oclaviServer + 'upgradePlan', data, vm.httpOptions).subscribe(res => {
                            vm.router.navigate(['/payment-status/razorpay/success/upgrade'], {
                                queryParams: {
                                    razorpay_payment_id: response.razorpay_payment_id
                                }
                            });
                        });
                    });
                }
            }

            var razorpay = new Razorpay(options);
            razorpay.open();
        }, err => {
            vm.errorHandler(err, 'Error upgrading your subscription.');
        });
    }

    paymentMethodChanged($event) {
        this.paymentMethod = $event.target.value;

        if (this.paymentMethod == 'paypal')
            this.selectedCurrency = 'USD';

        else if (this.paymentMethod == 'razorpay')
            this.selectedCurrency = 'INR';
    }

    paypalCheckout(vm) {
        vm.loadingService.show('Creating your paypal transaction...');

        vm.http.post(environment.oclaviServer + 'upgradePlan', { PAYMENT_SOURCE: 'PAYPAL', planDuration: this.planDuration }, vm.httpOptions).subscribe(res => {
            vm.loadingService.show('Redirecting to payment page...');

            var body = res.json();

            window.location.href = body.approval_url;
        }, err => {
            vm.errorHandler(err, 'Error while buying more seats...');
        });
    }

    selectInvoiceDate(newSelectedDate) {
        this.selectedDate = newSelectedDate;
    }

    errorHandler(response, message) {
        this.loadingService.hide();

        if (response.status == 401) {
            this.router.navigate(['login']);
            localStorage.removeItem('user');
        }

        else {
            var text = JSON.parse(response._body).message;

            if (!text || text == '')
                this.notify.error(null, message);

            else
                this.notify.error(null, text);
        }
    }


    setCurrentInvoice (index) {
        this.currentInvoice = this.payments[index];
    }
}
