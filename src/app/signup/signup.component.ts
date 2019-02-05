import { Component, OnInit, NgZone } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { Router, ActivatedRoute } from '@angular/router';
import { LoaderService } from '../loader.service';
import { LoggerService } from '../logger.service';
import { environment } from '../../environments/environment';
import { NotificationsService } from 'angular2-notifications';
import { AppService } from '../app-service.service';
import { Title, Meta } from '@angular/platform-browser';

declare var Razorpay: any;
declare var ProductTour: any;
declare var setTimeout: any;
declare var $: any;

@Component({
    selector: 'app-signup',
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
    httpOptions: RequestOptions;
    user: any;
    nameErrorFlag = false;
    emailErrorFlag = false;
    passwordErrorFlag = false;
    confirmPasswordErrorFlag = false;
    environment: any;
    plans: any;
    showModal = false;
    termPolicy = false;
    // price: Number;

    constructor(private http: Http, private router: Router, private route: ActivatedRoute, private notify: NotificationsService,
        private loadingService: LoaderService, private _ngZone: NgZone, private loggerService: LoggerService, private _appService: AppService,
        meta: Meta, titleService: Title) {
            titleService.setTitle('Signup | OCLAVI');
            meta.addTags([
                { name: 'author', content: 'Carabiner Technologies Private Limited'},
                { name: 'keywords', content: 'image annotation, polygon annotation, machine learning, labelling, classification, bound box annotation, image classification, artificial intelligence, deep learning classification, cuboidal annotation, cuboidal annotation tool, 3D cuboid annotations, 3d cuboid annotation tool, 3D cuboid for perception, 3D cuboid computer vision, 3D cuboid labeling, image annotation, machine learning annotations, computer vision models annotation, artificial intelligence, deep learning classification' },
                { name: 'description', content: 'Our image annotation platform allows to classify images for machine learning, aritifical intelligence and nlp models in a collaborative way which solve the real world problems.' }
            ]);
         }

    ngOnInit() {
        // if (!this._appService.getCookies('oclavi-pt-signup')) {
        //     setTimeout(() => {
        //         this.initTour();
        //     }, 1000);
        // }
        this.httpOptions = new RequestOptions({ withCredentials: true });
        this.environment = environment;
        this.user = {
            type: this.environment.USER_TYPE.SELF.NAME,
            seats: 3,
            name: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: ''
        };

        // this.price = 0;

        this.route.params.subscribe(params => {
            if (params['type'])
                this.user.type = params['type'];
        }).unsubscribe();

        // this.http.get(environment.oclaviServer + 'getPlanPrice', this.httpOptions).subscribe(res => {
        //     this.loadingService.hide();
        //
        //     this.plans = res.json();
        //
        //     this.getPrice(this.user.seats);
        // }, err => {
        //     this.loadingService.hide();
        //
        //     this.notify.error(null, 'Error fetching the plans');
        //     this.loggerService.log(err);
        // });
    }

    signUp() {
        if (this.validate()) {
            this.loadingService.show('Saving your details');
            // environment.oclaviServer + 'freeUserSignUp'
            this.http.post(environment.oclaviServer + 'signUp', this.user, this.httpOptions).subscribe(res => {
                this.loadingService.hide();
                this.notify.success('Registration Successfull.');
                this._appService.tempData = this.user;

                this._ngZone.run(() => this.router.navigate(['/verify-email']));
            }, err => {
                this.loadingService.hide();

                // this.notify.error(null, 'Server Error');
                this.errorHandler(err, 'Server Error');
                this.loggerService.log(err);
            });
        }
    }

    increaseSeat() {
        this.user.seats++;

        // this.getPrice(this.user.seats);
    }

    decreaseSeat() {
        if (this.user.seats > 1) {
            this.user.seats--;

            // this.getPrice(this.user.seats);
        }
    }

    validate() {
        var validate = true;

        if (this.user.name == '') {
            this.notify.error(null, 'Please enter user full name');
            validate = false;
        }

        var reg = /(?:[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-zA-Z0-9-]*[a-zA-Z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
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

    setProperty (key, value) {
        this.user[key] = value;
    }

    errorHandler(response, message) {
        //general purpose error handler
        this.loadingService.hide();

        if (response.status == 401)
            this.router.navigate(['login']);

        else if (Object.keys(response).length > 0) {
            var text = response.json().message;

            if (text != '')
                this.notify.error(null, text);

            else
                this.notify.error(null, message);
        }

        else
            this.notify.error(null, message);
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

    // getPrice(seats) {
    //     this.plans.forEach((plan) => {
    //         if ((seats >= plan.start) && (seats <= plan.end)) {
    //             this.price = plan.price;
    //
    //             return false;
    //         }
    //     });
    // }

    // changePlan(val) {
    //     if (val == 'self')
    //         this.getPrice(1);
    //
    //     else if (val == 'admin')
    //         this.getPrice(this.user.seats);
    // }

    initTour() {

        var productTour = new ProductTour({
            overlay: true,
            onStart: function() { },
            onChanged: function(e) { },
            onClosed: (e) => {
                this._appService.setCookies('oclavi-pt-signup', 1);
            }
        });

        productTour.steps([
            {
                element: '#span-self-classifier-block',
                title: 'Self Classifier',
                content: 'Select "Self Classifier" if you want to classify your own images',
                position: 'bottom'
            },
            {
                element: '#span-admin-block',
                title: 'Admin',
                content: 'Select "Admin" if you want to bring in your team to classify the images',
                position: 'bottom'
            }
        ]);

        productTour.startTour();

    }
}
