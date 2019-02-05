import { Component, OnInit, NgZone } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { Router, ActivatedRoute } from '@angular/router';
import { LoaderService } from '../loader.service';
import { LoggerService } from '../logger.service';
import { environment } from '../../environments/environment';
import { NotificationsService } from 'angular2-notifications';
import { AppService } from '../app-service.service';

declare var document: any;
declare var ProductTour: any;
declare var $: any;

@Component({
    selector: 'app-freelancersignup',
    templateUrl: './freelancersignup.component.html',
    styleUrls: ['./freelancersignup.component.scss']
})
export class FreelancerSignupComponent implements OnInit {
    httpOptions: RequestOptions;
    user: any;
    forgetPasswordUser: any;
    nameErrorFlag = false;
    emailErrorFlag = false;
    passwordErrorFlag = false;
    confirmPasswordErrorFlag = false;
    environment: any;
    plans: any;
    login: any = true;
    showModal = false;
    rememberMe = false;
    termPolicy = false;
    // price: Number;

    passwordMasking = [
        {
            type: 'password',
            class: 'fa fa-eye-slash password-masking-icon',
            show: true
        },
        {
            type: 'password',
            class: 'fa fa-eye-slash password-masking-icon',
            show: true
        },
        {
            type: 'password',
            class: 'fa fa-eye-slash password-masking-icon',
            show: true
        }
    ]

    constructor(private http: Http, private router: Router, private route: ActivatedRoute, private notify: NotificationsService,
        private loadingService: LoaderService, private _ngZone: NgZone, private loggerService: LoggerService, private _appService: AppService) { }

    ngOnInit() {
        this.httpOptions = new RequestOptions({ withCredentials: true });
        this.environment = environment;
        this.user = {
            seats: 3,
            name: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: '',
            rememberMe: false
        };

        this.forgetPasswordUser = {
            type: 'freelancer',
            email: ''
        };

        let url = this.router.url;
        if (url.indexOf('signup') !== -1) {
            this.login = false;
        }
    }

    freeSignUp() {
        if (this.validate()) {
            this.loadingService.show('Please Wait...');

            this.http.post(environment.oclaviServer + 'freelancer/signup', this.user, this.httpOptions).subscribe(res => {
                this.loadingService.hide();
                this.notify.success('Registeration Successfull.');
                this._appService.tempData = this.user;

                this._ngZone.run(() => this.router.navigate(['/verify-email']));
            }, err => {
                this.loadingService.hide();

                this.errorHandler(err, 'Some unexpected error has occured.');

                this.loggerService.log(err);
            });
        }
    }

    validate() {
        var validate = true;

        if (this.user.name == '') {
            this.notify.error(null, 'Please enter user full name');
            validate = false;
        }

        var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
        if (reg.test(this.user.email) == false) {
            this.notify.error(null, 'Please enter valid email address');
            validate = false;
        }

        if (this.user.password == '' || this.user.password.length < 6) {
            this.notify.error(null, 'Enter enter min 6 apha-numeric password')
            validate = false;
        }

        if (this.user.confirmPassword == '' || this.user.password != this.user.confirmPassword) {
            this.notify.error(null, 'Confirm password and password should be same');
            validate = false;
        }

        if (!this.termPolicy) {
            this.notify.error(null, 'Please accept term and policies.');
            validate = false;
        }

        return validate;
    }

    toggleWrapper() {
        this.login = !this.login;
    }

    loginCall() {
        var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
        if (reg.test(this.user.email) == false) {
            this.notify.error(null, 'Please enter valid email address');
            return;
        }

        if (this.user.password == '') {
            this.notify.error(null, 'Enter enter apha-numeric password')
            return;
        }

        this.loadingService.show('Saving your details');

        this.http.post(environment.oclaviServer + 'freelancer/login', this.user, this.httpOptions).subscribe(res => {
            this.loadingService.hide();
            var body = JSON.parse(res['_body']);
            this._appService.tempData = body.user;
            localStorage.setItem('user', JSON.stringify(body.user));
            this.router.navigate([body.redirect]);
        }, err => {
            this.loadingService.hide();

            localStorage.removeItem('user');

            this.errorHandler(err, 'Some unexpected error has occured.');
        });
    }

    forgotPassword() {
        var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
        if (reg.test(this.user.email) == false) {
            this.notify.error(null, 'Please enter valid email address');
            return;
        }
        else {
            this.forgetPasswordUser.email = this.user.email;

            this.loadingService.show('Saving your details');

            this.http.post(environment.oclaviServer + 'do/forgetpassword', this.forgetPasswordUser, this.httpOptions).subscribe(res => {
                this.loadingService.hide();
                this.notify.success(null, "Forget password init successfully");
                this.notify.info(null, "Please check your mails");
            },
            err => {
                this.loadingService.hide();
                this.notify.error(null, err);
            })
        }


    }

    closeModal() {
        this.showModal = false;
    }

    agree() {
        this.termPolicy = true;
        this.showModal = false;
    }

    showTermPolicy() {
        this.showModal = true;
        $(document).ready(function() {
            $('.modal-inner-content').scroll(function() {
                if ($(this).scrollTop() == $(this)[0].scrollHeight - $(this).height()) {
                    $('#agree').removeAttr('disabled');
                }
            });
        });
    }

    toggle(index) {
        console.log("toggling");
        if (this.passwordMasking[index].show == true) {
            this.passwordMasking[index].type = 'text';
            this.passwordMasking[index].class = 'fa fa-eye password-masking-icon';
            this.passwordMasking[index].show = false;
        } else {
            this.passwordMasking[index].type = 'password';
            this.passwordMasking[index].class = 'fa fa-eye-slash password-masking-icon';
            this.passwordMasking[index].show = true;
        }

    }

    errorHandler(response, message) {
        this.loadingService.hide();

        if (response.status == 401)
            this.router.navigate(['login']);

        else {
            var text = response.json().message;

            if (text != '')
                this.notify.error(null, text);

            else
                this.notify.error(null, message);
        }
    }

}
