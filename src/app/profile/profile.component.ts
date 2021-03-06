import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { AppService } from '../app-service.service';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { LoaderService } from '../loader.service';
import { AlertService } from '../alert.service';
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from '../../environments/environment';
import { NotificationsService } from 'angular2-notifications';
import { ProjectService } from '../project.service';
import { Title, Meta } from '@angular/platform-browser';

declare var io: any;

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ProfileComponent implements OnInit, OnDestroy {

    userData = {
        NAME: '',
        EMAIL_ID: '',
        USER_TYPE: ''
    };
    session: any;
    currentStatus: any;
    userAvatar = "../../assets/profile.png";
    httpOptions: RequestOptions;
    socket: any;
    isPlanActive = true;
    environment: any;
    readonly STATUS_INITIAL = 0;
    readonly STATUS_SAVING = 1;
    readonly STATUS_SUCCESS = 2;
    readonly STATUS_FAILED = 3;
    tabSubscription;


    constructor(private http: Http, private appService: AppService,
        private router: Router, private route: ActivatedRoute,
        private loadingService: LoaderService, private alertService: AlertService,
        private notify: NotificationsService, private projectService: ProjectService,
        meta: Meta, titleService: Title) {

        titleService.setTitle('Profile | OCLAVI');
        meta.addTags([
            { name: 'author', content: 'Carabiner Technologies Private Limited' }
        ]);

        this.currentStatus = this.STATUS_INITIAL;
        this.environment = environment;
        this.httpOptions = new RequestOptions({ withCredentials: true });

        this.socket = appService.getSocket();

        var userLocalData = localStorage.getItem('user');

        this.appService.getUser().subscribe((data) => {
            this.userData = data;
            this.appService.tempData = data;
            localStorage.setItem('user', JSON.stringify(data));
            // if (this.userData['USER_TYPE'] == "team")
            //     this.router.navigateByUrl('/');

            if (this.userData['USER_AVATAR'] != undefined) {
                this.userAvatar = environment.oclaviServer + 'avatar/' + this.userData['USER_AVATAR'];
                this.userData['USER_AVA'] = this.userAvatar;
            }

            else
                this.userData['USER_AVA'] = this.userAvatar;
        }, (err) => {
            this.router.navigateByUrl('/');
        });
    }

    user = {
        type: '',
        name: '',
        email: '',
        renewalDate: '',
        imageCount: 0,
        imageClassified: 0,
        storage: ''
    };

    tab: string;

    ngOnInit() {
        this.route.params.subscribe(params => {
            if (params['id'])
                this.tab = params['id'];
        }).unsubscribe();

        this.session = JSON.parse(localStorage.getItem('user'));
        console.log(this.session);

        // Get Projects of user
        this.loadingService.show('Fetching your projects...');
        this.projectService.getProjects()
            .subscribe(response => {
                this.session.PROJECTS = response.projects;

                this.loadingService.hide();
                localStorage.setItem('user', JSON.stringify(this.session));
                if ((this.router.url.slice(this.router.url.lastIndexOf('/') + 1)) === 'profile') {
                    if((this.session.USER_TYPE == environment.USER_TYPE.ADMIN.NAME || this.session.USER_TYPE == environment.USER_TYPE.SELF.NAME)
                                                && (this.session.PLAN_END_DATE < (new Date()).getTime())) {
                      this.isPlanActive = false;
                      this.appService.currentTab.next('payment');
                      this.router.navigate(['profile/payment']);
                    }

                    else {
                      this.appService.currentTab.next('my_project');
                      this.router.navigate(['profile/my_project']);
                    }
                }
            }, err => {
                this.loadingService.hide();
                this.notify.error(null, err);
            });

        this.socket.on('multipleSession', (data) => {
            this.alertService.show('error', 'Multiple Session Detected.');
        });

        // Listen to tab change
        this.tabSubscription = this.appService.currentTab.subscribe(TAB => this.tab = TAB);

        // To identify tab If user writes url manually
        let url = this.router.url.slice(this.router.url.lastIndexOf('/') + 1);
        if (url === 'image_settings' || url === 'label_settings' || url === 'view_image') {
            url = 'project_settings';
        }
        this.appService.currentTab.next(url);

        // if (this.appService.getCookies('oclavi-image-tour'))
        //     this.tab = 'image-settings';

        // else {
        // this.tab = 'docs';
        // this.appService.currentTab.next(this.tab);
        // this.router.navigate(['profile/docs']);
        // }
    }

    renewalDateUpdated($event) {
        this.user.renewalDate = $event;
    }

    planTypeUpdated($event) {
        this.userData.USER_TYPE = $event;
    }

    changeTab(tab) {
        this.tab = tab;
        this.appService.currentTab.next(tab);
        this.router.navigate(['profile/' + tab]);
    }

    changeImage() { }

    filesChange(fieldName: string, fileList: FileList) {
        const formData = new FormData();

        if (!fileList.length)
            return;

        Array.from(Array(fileList.length).keys()).map(x => {
            formData.append(fieldName, fileList[x], fileList[x].name);
        });

        this.save(formData);
    }

    save(formData: FormData) {
        this.currentStatus = this.STATUS_SAVING;
        this.appService.upload(formData).subscribe(x => {
            console.log(x);
            this.userAvatar = x;
            if (x != undefined) {
                this.userData['USER_AVA'] = x;
                this.currentStatus = this.STATUS_SUCCESS;
            }
        }, err => {
            console.log(err);
            this.currentStatus = this.STATUS_FAILED;
        });
    }

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

    logOut() {
        this.alertService.show('warn', 'Do you want to log out ?');

        this.alertService.positiveCallback = (() => {
            this.alertService.hide();

            this.appService.doLogOut().subscribe((res) => {
                this.appService.tempData = {};
                this.appService.isLogin.next(false);

                localStorage.clear();

                this.socket.emit('logout');

                this.router.navigateByUrl('/login');
            }, (err) => {
                this.errorHandler(err, 'Error while logging out the user.');
            });
        });
    }

    ngOnDestroy() {
        this.tabSubscription.unsubscribe();
    }
}
