import { Component, OnInit } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { Router, ActivatedRoute } from "@angular/router";
import { environment } from '../../environments/environment';
import { LoggerService } from '../logger.service';
import { LoaderService } from '../loader.service';
import { AppService } from '../app-service.service';
import { AlertService } from '../alert.service';
import { NotificationsService } from 'angular2-notifications';
import { ProjectService } from '../project.service';
import { Title, Meta } from '@angular/platform-browser';

declare var $: any;
declare var ProductTour: any;
declare var setTimeout: any;

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

    user = {
        type: 'self',
        email: '',
        password: '',
        ipDetails: {}
    };

    forgetPasswordUser = {
        type: 'self',
        email: ''
    };

    loginForm = true;
    forgetPasswordForm = false;
    resetPasswordForm = false;

    token;
    resetPasswordError = false;
    resetPasswordErrorMsg = ''

    resetPassword = {
        password: '',
        confirmPassword: ''
    }

    selectedProject = {
        ID: '',
        NAME: ''
    };
    PROJECTS;
    isModalOpen = false;

    constructor(private http: Http, private router: Router, private _appService: AppService, private loadingService: LoaderService,
        private alertService: AlertService, private notify: NotificationsService, private route: ActivatedRoute,
        private loggerService: LoggerService, private projectService: ProjectService, meta: Meta, titleService: Title) {

        titleService.setTitle('Login | OCLAVI');
        meta.addTags([
            { name: 'author', content: 'Carabiner Technologies Private Limited'},
            { name: 'keywords', content: 'image annotation, polygon annotation, machine learning, labelling, classification, bound box annotation, image classification, artificial intelligence, deep learning classification, cuboidal annotation, cuboidal annotation tool, 3D cuboid annotations, 3d cuboid annotation tool, 3D cuboid for perception, 3D cuboid computer vision, 3D cuboid labeling, image annotation, machine learning annotations, computer vision models annotation, artificial intelligence, deep learning classification' }
        ]);

        this.route.params.subscribe(params => {
            this.token = params['token'];

            if (this.token != null) {
                this.loginForm = false;
                this.resetPasswordForm = true;

                let data = { token: this.token };

                this.loadingService.show('Checking our database...');

                this.http.post(environment.oclaviServer + 'verify/password-token', data).subscribe(res => {
                    this.loadingService.hide();
                }, err => {
                    this.loadingService.hide();

                    var body = JSON.parse(err['_body']);
                    this.resetPasswordError = true;
                    this.resetPasswordErrorMsg = body['message'];
                });
            }
        });
    }

    ngOnInit() {
        // if (!this._appService.getCookies('oclavi-l')) {
        //     setTimeout(() => {
        //         this.initTour();
        //     }, 1000);
        // }

        console.log(environment.name);
        this.route.params.subscribe(params => {
            if (params['type'])
                this.user.type = params['type'];
        }).unsubscribe();

        this.http.get('https://ipapi.co/json')
            .subscribe(res => this.user.ipDetails = res.json(),
                       err => console.log(err));
    }

    submit() {
        if (this.validator()) {
            this.loadingService.show('Checking our database...');
            let options = new RequestOptions({ withCredentials: true });

            this.http.post(environment.oclaviServer + 'login', this.user, options).subscribe(res => {
                this.loadingService.hide();
                console.log(res.json())
                var body = JSON.parse(res['_body']);

                this._appService.tempData = body.user;

        /******************** If team user should not be able to go profile page, Uncomment below code ************************/
                // if (this.user.type === 'team' && body.adminProjects && !body.redirect) {  // If user is team user, show Select Project Modal
                //     this.PROJECTS = {};
                //     body.user.PROJECTS.forEach( project => {
                //         this.PROJECTS[project.PROJECT_ID] = {
                //             NAME: body.adminProjects[project.PROJECT_ID].NAME
                //         };
                //     });
                //     body.user.PROJECTS = this.PROJECTS;
                //     localStorage.setItem('user', JSON.stringify(body.user));
                //     this.isModalOpen = true;
                //     $('#selectProject').modal('show');
                // } else {                                    // If user is not team user
                    localStorage.setItem('user', JSON.stringify(body.user));
                    this.router.navigate([body.redirect]);
                // }
            }, err => {
                localStorage.removeItem('user');

                this.errorHandler(err, 'Some unexpected error has occured.');
            });
        }
    }

    // To make sure fields are not empty
    validator() {
        if (this.user.email == '' || this.user.password == '') {
            this.notify.error(null, "Please enter your email and password");
            return false;
        }

        var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
        if (reg.test(this.user.email) == false) {
            this.notify.error(null, "Please enter your email address");
            return false;
        }

        return true;
    }

    forgetPassword() {
        var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
        if (reg.test(this.forgetPasswordUser.email) == false) {
            this.notify.error(null, "Please enter your email address");
            return false;
        }

        this._appService.forgetPassword(this.forgetPasswordUser).subscribe((data) => {
            this.loggerService.log(data);

            this.notify.success(null, "Forget password init successfully");
            this.notify.info(null, "Please check your mails");
            this.setLoginForm();
        }, (err) => {
            this.loggerService.log(err);

            this.notify.error(null, err);
        })
    }

    // To enable forget password form
    setForgetPassword() {
        this.loginForm = false;
        this.resetPasswordForm = false;
        this.forgetPasswordForm = true
    }

    // To enable login form
    setLoginForm() {
        this.forgetPasswordForm = false;
        this.resetPasswordForm = false;
        this.loginForm = true;
    }

    savePassword() {
        if (this.resetPassword.password == '' || this.resetPassword.password.length < 6) {
            this.notify.error(null, "Please enter min 6 alpha-numeric password");
        }
        else if (this.resetPassword.confirmPassword == '' || this.resetPassword.confirmPassword.length < 6) {
            this.notify.error(null, "Please enter min 6 alpha-numeric password");
        } else if (this.resetPassword.password != this.resetPassword.confirmPassword) {
            this.notify.error(null, "Password and confirm password should be same");
        } else {

            let data = {
                token: this.token,
                password: this.resetPassword.password
            }
            this.loadingService.show('Saving new password...');
            this.http.post(environment.oclaviServer + 'reset-password', data).subscribe(res => {
                this.loadingService.hide();
                // this.setLoginForm();
                this.router.navigate([res.json().redirect])
                this.notify.success(null, "Password change successfully");
                this.notify.info(null, "Please do login now");
            }, err => {
                this.loadingService.hide();
                var body = JSON.parse(err['_body']);
                this.notify.error(null, body['message']);
            });
        }
    }

    // error Handler, Used when made request to backend
    errorHandler(response, message) {
        this.loadingService.hide();

        if (response.status == 401)
            this.router.navigate(['login']);

        else {
            var text = JSON.parse(response._body).message;

            if (text != '')
                this.notify.error(null, text);

            else
                this.notify.error(null, message);
        }
    }

    // For the Modal (For team user only)
    selectProject (project) {
        this.selectedProject.ID = project.key;
        this.selectedProject.NAME = project.value.NAME;
    }

    // For the Modal (For team user only)
    classify() {
        if (this.selectedProject.ID !== '') {
            $('#selectProject').modal('hide');

            this.loadingService.show('Checking our database...');
            this.isModalOpen = false;
            this.projectService.currentProject = this.selectedProject.ID;
            const options = new RequestOptions({ withCredentials: true });

            this.http.post(environment.oclaviServer + 'classify', {projectId: this.selectedProject.ID}, options)
            .subscribe(res => {
                this.router.navigate([res.json().redirect]);

                    this.loadingService.hide();
                }, err => {
                    this.errorHandler(err, 'Some unexpected error has occured.');
                });
        }
    }

    initTour() {

        var productTour = new ProductTour({
            overlay: true, // optional (true || false) defaults: true
            onStart: function() { }, // called when tour starts || optional
            onChanged: function(e) { }, // called when tour changes || optional
            onClosed: (e) => {
                this._appService.setCookies('oclavi-l', 1);
            } // called when the tour has been closed || optional
        });

        // can only be called once
        productTour.steps([ // pass an array of tour steps
            {
                element: '.classifyType', // specify the target selector by id or class #search or .header (defaults: body)
                title: 'User Type', // title of the tour step
                content: 'Pick the appropriate user type', // content. Could be text or html. (if html set html attribute above to be true)
                position: 'right' // top, bottom, right, left
            }
        ]);

        productTour.startTour();

    }
}
