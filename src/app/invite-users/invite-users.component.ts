import { Component, OnInit, Input, NgZone } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { Router, ActivatedRoute } from '@angular/router';
import { AppService } from '../app-service.service';
import { AlertService } from '../alert.service';
import { LoggerService } from '../logger.service';
import { LoaderService } from '../loader.service';
import { environment } from '../../environments/environment';
import { NotificationsService } from 'angular2-notifications';
import { Title } from '@angular/platform-browser';
import { ProjectService } from '../project.service';

declare var $: any;
declare var Razorpay: any;

@Component({
    selector: 'app-invite-users',
    templateUrl: './invite-users.component.html',
    styleUrls: ['./invite-users.component.scss']
})
export class InviteUsersComponent implements OnInit {

    user: any;
    httpOptions: RequestOptions;
    invitedUsers: any;
    invitedUser: any;
    session: any;
    editFlag: Boolean;
    projectId: string;
    billingAmount: any;
    teamMembers: any;
    hideResults = true;
    environment: any;
    isPlanActive: Boolean;
    inviteButtonFlag = false;
    seatProgressWidth = 0;
    selectedCurrency: string;
    settingsTab: string;
    paymentMethod: string;
    settings = {
        usedSeat: 0,
        totalseat: 0,
        tobuy: 1
    }
    step1: any;
    activeAccordion: string;

    constructor(private http: Http, private router: Router, private route: ActivatedRoute,
        private _appService: AppService, private loadingService: LoaderService,
        private alertService: AlertService, private notify: NotificationsService,
        private loggerService: LoggerService, private ngZone: NgZone, private titleService: Title,
        private projectService: ProjectService) {
        this.editFlag = false;
        this.invitedUser = {
            NAME: '',
            EMAIL_ID: '',
            defaultPassword: ''
        }
    }

    ngOnInit() {
        this.titleService.setTitle('Invite Users | OCLAVI');
        this.httpOptions = new RequestOptions({ withCredentials: true });
        this.session = JSON.parse(localStorage.getItem('user'));
        this.settings.usedSeat = this.session.TOTAL_SEATS_USED;
        this.settings.totalseat = this.session.TOTAL_SEATS_PURCHASED;
        this.environment = environment;
        this.isPlanActive = true;
        this.selectedCurrency = 'INR';
        this.paymentMethod = 'razorpay';

        let url = environment.oclaviServer + 'invitedUsers';

        this.step1 = {
            step: 1,
            title: 'buy_more_seats',
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

        if (this.session.USER_TYPE == environment.USER_TYPE.TEAM.NAME) {
            this.router.navigate(['profile']);
        }

        if (this.router.url.indexOf('projects') !== -1) {
            this.projectId = this.projectService.currentProject;

            // Invite user page not available If project has to be annotated by freelancer
            if (this.session.PROJECTS[this.projectId].ANNOTATE_BY === environment.USER_TYPE.FREELANCER.NAME) {
                this.router.navigateByUrl('/profile');
                return;
            }

            if ((this.session.USER_TYPE == environment.USER_TYPE.ADMIN.NAME || this.session.USER_TYPE == environment.USER_TYPE.SELF.NAME)
                && (this.session.PLAN_END_DATE < (new Date()).getTime())) {
                this.isPlanActive = false;
                this._appService.currentTab.next('payment');
                this.router.navigate(['profile/payment']);
            }

            url = environment.oclaviServer + 'projectInvitedUsers?projectId=' + this.projectId;
        }

        this.http.get(url, this.httpOptions).subscribe(res => {
            this.invitedUsers = res.json();
        }, err => {
            this.errorHandler(err, 'Error while getting invited users');
        });

        // this._appService.getUserPurchaseSeats().subscribe((data) => {
        //     this.settings.usedSeat = data.seats.used;
        //     this.settings.totalseat = data.seats.total;

        //     this.setInviteWrapperSetting();
        // }, (err) => {
        //     this.loggerService.log(err);
        // });
    }

    paymentMethodChanged($event) {
        console.log($event.target.value)

        this.paymentMethod = $event.target.value;

        if (this.paymentMethod == 'paypal')
            this.selectedCurrency = 'USD';

        else if (this.paymentMethod == 'razorpay')
            this.selectedCurrency = 'INR';
    }

    editDetails(index) {
        this.editFlag = true;

        this.invitedUser = {
            _id: this.invitedUsers[index]._id,
            NAME: this.invitedUsers[index].NAME,
            EMAIL_ID: this.invitedUsers[index].EMAIL_ID,
            index: index
        }

        this.openModal('inviteUserModal', false);
    }

    openModal(id, paymentModal) {
        if (paymentModal) {
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
        }

        $('#' + id).modal(open);
    }

    resetDetails() {
        this.editFlag = false;

        this.invitedUser = {
            _id: '',
            NAME: '',
            EMAIL_ID: ''
        };
    }

    changeSettingsTab(tab) {
        this.settingsTab = tab;
    }

    saveDetails() {
        $('#inviteUserModal').modal('hide');

        if (this.validator()) {
            this.editFlag = false;
            this.http.post(environment.oclaviServer + 'saveInvitedUserDetails', JSON.stringify(this.invitedUser), this.httpOptions).subscribe(res => {
                this.notify.success('Team user details updated.');
                this.invitedUsers[this.invitedUser.index] = {
                    _id: this.invitedUser._id,
                    NAME: this.invitedUser.NAME,
                    EMAIL_ID: this.invitedUser.EMAIL_ID
                }

                this.invitedUser = {
                    NAME: '',
                    EMAIL_ID: ''
                }
            }, err => {
                this.errorHandler(err, 'Error while updating details');
            });
        }
    }

    deleteUser(index) {
        this.alertService.show('warn', 'Do you want to delete this user?');

        this.alertService.positiveCallback = (() => {
            this.alertService.hide();

            this.http.delete(environment.oclaviServer + 'deleteTeamUser/' + this.invitedUsers[index]._id, this.httpOptions).subscribe(res => {
                this.notify.success('Team user removed successfully.');

                this.invitedUsers.splice(index, 1);
                this.settings.usedSeat = this.settings.usedSeat - 1;
                this.setInviteWrapperSetting();
                this.session.TOTAL_SEATS_USED = this.settings.usedSeat;
                localStorage.setItem('user', JSON.stringify(this.session));
            }, err => {
                this.errorHandler(err, 'Error while deleting the team user.');
            });
        });
    }

    // For Global invite user
    sendInvite() {
        $('#inviteUserModal').modal('hide');
        if (this.validator()) {
            this.loadingService.show('Sending Invite to ' + this.invitedUser.EMAIL_ID);

            this.http.post(environment.oclaviServer + 'sendInvite', JSON.stringify(this.invitedUser), this.httpOptions).subscribe(res => {
                this.notify.success('Invite has been sent.');

                var body = res.json();

                this.invitedUsers.push({
                    _id: res.json().insertedId,
                    NAME: this.invitedUser.NAME,
                    EMAIL_ID: this.invitedUser.EMAIL_ID
                });

                this.settings.usedSeat = this.settings.usedSeat + 1;
                this.setInviteWrapperSetting();

                this.session.TOTAL_SEATS_USED = this.settings.usedSeat;
                localStorage.setItem('user', JSON.stringify(this.session));

                this.invitedUser = {
                    NAME: '',
                    EMAIL_ID: ''
                }

                this.loadingService.hide();
            }, err => {
                this.errorHandler(err, 'Error while sending invite.');
            });
        }
    }

    // Get list of team users
    getTeamUsers() {
        this.http.get(environment.oclaviServer + 'invitedUsers', this.httpOptions).subscribe(res => {
            this.teamMembers = res.json();
            this.hideResults = false;
        }, err => {
            this.errorHandler(err, 'Error while getting team users');
        });
    }

    sendProjectInvite(teamMember) {
        this.hideResults = true;
        if (this.router.url.indexOf('projects') !== -1 && teamMember) {
            this.loadingService.show('Sending Invite to ' + teamMember.EMAIL_ID);
            teamMember.projectId = this.projectId;
            let data = JSON.stringify(teamMember);

            this.http.post(environment.oclaviServer + 'sendProjectInvite', data, this.httpOptions).subscribe(res => {
                this.notify.success('Invite has been sent.');

                var body = res.json();

                this.invitedUsers.push(teamMember);

                this.session.PROJECTS[this.projectId].TOTAL_INVITED_USERS += 1;
                localStorage.setItem('user', JSON.stringify(this.session));
                this.loadingService.hide();
            }, err => {
                this.errorHandler(err, 'Error while sending project invite.');
            });
        }
    }

    hide() {  // Hide result fallout of team users
        setTimeout(() => this.hideResults = true, 200);
    }

    removeProjectInvite(index) {
        this.alertService.show('warn', 'Do you want to remove this user from current project?');

        this.alertService.positiveCallback = (() => {
            this.alertService.hide();
            let data = { _id: this.invitedUsers[index]._id, projectId: this.projectId };

            this.http.post(environment.oclaviServer + 'removeProjectInvite', data, this.httpOptions).subscribe(res => {
                this.notify.success('Team user removed successfully.');
                this.invitedUsers.splice(index, 1);
                this.session.PROJECTS[this.projectId].TOTAL_INVITED_USERS -= 1;
                localStorage.setItem('user', JSON.stringify(this.session));
            }, err => {
                this.errorHandler(err, 'Error while sending remove player invite');
            });
        });
    }

    showPaymentModal() {
        this.loadingService.show('Loading payment information. Please wait...');

        this.http.post(environment.oclaviServer + 'getBillingAmount', { seats: this.settings.tobuy, type: 'buyMoreSeats' }, this.httpOptions).subscribe(res => {
            this.loadingService.hide();

            this.openModal('buyMoreSeats', true);

            this.billingAmount = res.json();
            this.billingAmount.planEndDate += ((new Date()).getTimezoneOffset() * 60 * 1000);
        }, err => {
            this.errorHandler(err, 'Error upgrading your subscription.');
        });
    }

    payNow(vm, paymentMethod) {
        $('#buyMoreSeats').modal('hide');

        if (paymentMethod == 'paypal')
            vm.paypalCheckout(vm);

        else if (paymentMethod == 'razorpay')
            vm.razorpayCheckout(vm);
    }

    razorpayCheckout(vm) {
        vm.http.post(environment.oclaviServer + 'razorpay/getModalData', { seats: vm.settings.tobuy, type: 'buyMoreSeats' }, vm.httpOptions).subscribe(res => {
            let data = res.json();

            if (data.AMOUNT < 100)
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
                        data.seats = vm.settings.tobuy;

                        vm.http.post(environment.oclaviServer + 'buyMoreSeats', data, vm.httpOptions).subscribe(res => {
                            vm.loadingService.hide();

                            vm.router.navigate(['/payment-status/razorpay/success/buyMoreSeats'], {
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

    paypalCheckout(vm) {
        vm.loadingService.show('Creating your paypal transaction...');

        vm.http.post(environment.oclaviServer + 'buyMoreSeats', { seats: vm.settings.tobuy, PAYMENT_SOURCE: 'PAYPAL' }, vm.httpOptions).subscribe(res => {
            vm.loadingService.show('Redirecting to payment page...');

            var body = res.json();

            window.location.href = body.approval_url;
        }, err => {
            vm.errorHandler(err, 'Error while buying more seats...');
        });
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

    validator() {

        var validate = true;
        if (this.editFlag) {
            if (this.invitedUser.NAME == '' || this.invitedUser.NAME.length < 3) {
                this.notify.error(null, 'Please enter user name');
                validate = false;
            }
            var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
            if (reg.test(this.invitedUser.EMAIL_ID) == false) {
                this.notify.error(null, 'Please enter correct user email');
                validate = false;
            }
            return validate;
        } else {

            if (this.invitedUser.NAME == '' || this.invitedUser.NAME.length < 3) {
                this.notify.error(null, 'Please enter user name');
                validate = false;
            }
            var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
            if (reg.test(this.invitedUser.EMAIL_ID) == false) {
                this.notify.error(null, 'Please enter correct user email');
                validate = false;
            }

            if (this.invitedUser.defaultPassword == '' || this.invitedUser.defaultPassword.length < 6) {
                this.notify.error(null, 'Please enter default password');
                validate = false;
            }
            return validate;

        }

    }

    increaseSeat() {
        this.settings.tobuy = this.settings.tobuy + 1;
    }

    decreaseSeat() {
        if (this.settings.tobuy > 1)
            this.settings.tobuy--;
    }

    setInviteWrapperSetting() {
        if (this.settings.totalseat <= this.settings.usedSeat) {
            this.inviteButtonFlag = true;
        } else {
            this.inviteButtonFlag = false;
        }
        if (this.settings.usedSeat != 0) {
            this.seatProgressWidth = ((this.settings.usedSeat) / this.settings.totalseat) * 100;
        } else {
            this.seatProgressWidth = 0;
        }
    }
}
