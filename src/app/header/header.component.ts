import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { AppService } from './../app-service.service';
import { environment } from '../../environments/environment';
import { Router } from "@angular/router";
import { LoaderService } from '../loader.service';
import { LoggerService } from '../logger.service';
import { NotificationsService } from 'angular2-notifications';
import { AlertService } from '../alert.service';
import { ProjectService } from '../project.service';

declare var $: any;

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {

    @Input() userData;
    session: any;
    httpOptions: any;
    classifyFlag: Boolean;
    classifyChangeProjectFlag: Boolean;
    profileFlag: Boolean;
    userMetaFlag = true;
    @Input() TAB;
    socket: any;
    environment: any;
    @Output() openTab: EventEmitter<string> = new EventEmitter<string>();
    user;
    selectedProject;

    constructor(private appService: AppService, private alertService: AlertService, private loggerService: LoggerService,
        private loadingService: LoaderService, private http: Http, public router: Router, private notify: NotificationsService,
        private projectService: ProjectService) {

        this.environment = environment;
        this.socket = appService.getSocket();
    }


    ngOnInit() {
        this.httpOptions = new RequestOptions({ withCredentials: true });
        this.session = JSON.parse(localStorage.getItem('user'));

        this.loggerService.log(this.router.url);

        if (this.router.url.indexOf('profile') != -1)
            this.classifyFlag = true;

        if (this.router.url.indexOf('classify') != -1)
            this.classifyChangeProjectFlag = true;

        else if (this.router.url.indexOf("verify-email") != -1)
            this.userMetaFlag = false;

        this.user = JSON.parse(localStorage.getItem('user'));
        this.appService.userAvatar.subscribe(avatar => this.userData['USER_AVATAR'] = avatar).unsubscribe();
    }

    home() {
        this.router.navigate(['/profile']);
    }

    logOut() {
        this.alertService.show('warn', 'Do you want to log out?');

        this.alertService.positiveCallback = (() => {
            this.loadingService.show('Logging out...');

            this.alertService.hide();

            this.appService.doLogOut().subscribe((res) => {
                this.appService.tempData = {};
                this.appService.isLogin.next(false);

                localStorage.clear();

                this.socket.emit('logout');

                // if (this.router.url.indexOf('freelancer') != -1)
                if (this.userData.USER_TYPE === 'freelancer')
                    this.router.navigate(['/freelancer/login']);

                else
                    this.router.navigate(['/login']);

                this.loadingService.hide();
            }, (err) => {
                this.loggerService.log(err);

                this.loadingService.hide();
            })
        });
    }

    classify() {
        if (this.selectedProject) {
            $('#selectProjectModal').modal('hide');
            this.projectService.currentProject = this.selectedProject.key;
            this.loadingService.show('Checking our database...');

            // Checking if project has to be annotated by freelancer and project owner has classified necessary amount of images for training
            if (this.userData.USER_TYPE !== environment.USER_TYPE.TEAM.NAME && this.userData.PROJECTS && this.userData.PROJECTS[this.selectedProject.key].ANNOTATE_BY === 'freelancer') {
                const totalImages = this.userData.PROJECTS[this.selectedProject.key].TOTAL_IMAGES;
                const classifiedImages = this.userData.PROJECTS[this.selectedProject.key].TOTAL_CLASSIFIED_IMAGES;
                const progress = Math.ceil(( classifiedImages / totalImages) * 100);
                // If true, don't llow user to classify further for this project
                if (progress >= this.projectService.getClassifyImageLimit(totalImages)) {
                    this.loadingService.hide();
                    this.notify.error('Further images have to be classified by freelancer');
                    return;
                }
            }


            this.http.post(environment.oclaviServer + 'classify', { projectId: this.selectedProject.key }, this.httpOptions)
                .subscribe(res => {
                    // window.location.href = environment.oclaviUi + res.json().redirect;
                    this.router.navigate([res.json().redirect]);

                    this.loadingService.hide();
                }, err => {
                    this.loadingService.hide();
                    this.errorHandler(err, 'Some unexpected error has occured.');
                });
        }
    }

    goToProfile() {
        this.router.navigate(['profile']);
    }

    goToProfileSettings() {
        this.router.navigate(['/profile/profile_settings'])
    }

    goToFreelancerProfile() {
        this.router.navigate(['/freelancer/profile'])
    }

    goToPayment() {
        this.router.navigate(['/profile/payment'])
    }

    // Error handler, used when making a request to backend
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

    // Changing route
    changeTab(tab) {
        this.openTab.emit(tab);
    }


    selectProject(project) {
        this.selectedProject = project;
    }

    ngOnDestroy() {

    }
}
