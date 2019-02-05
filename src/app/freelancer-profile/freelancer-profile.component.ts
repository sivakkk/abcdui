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

@Component({
  selector: 'app-freelancer-profile',
  templateUrl: './freelancer-profile.component.html',
  styleUrls: ['./freelancer-profile.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FreelancerProfileComponent implements OnInit, OnDestroy {

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
  environment: any;
  readonly STATUS_INITIAL = 0;
  readonly STATUS_SAVING = 1;
  readonly STATUS_SUCCESS = 2;
  readonly STATUS_FAILED = 3;
  tabSubscription;


  constructor(private http: Http, private _appService: AppService,
      private router: Router, private route: ActivatedRoute,
      private loadingService: LoaderService, private alertService: AlertService,
      private notify: NotificationsService, private projectService: ProjectService,
      meta: Meta, titleService: Title, private appService: AppService) {

      titleService.setTitle('Profile | OCLAVI');
      meta.addTags([
          { name: 'author', content: 'Carabiner Technologies Private Limited' }
      ]);

      this.currentStatus = this.STATUS_INITIAL;
      this.environment = environment;
      this.httpOptions = new RequestOptions({ withCredentials: true });

      this.socket = appService.getSocket();

      var userLocalData = localStorage.getItem('user');

      // If user is tem user redirecting to home page
      this._appService.getUser().subscribe((data) => {
          this.userData = data;
          this._appService.tempData = data;
          localStorage.setItem('user', JSON.stringify(data));
          if (this.userData['USER_TYPE'] == "team")
              this.router.navigateByUrl('/');

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

        // If there is only 'profile' in url, redirect to MY project
        if ((this.router.url.slice(this.router.url.lastIndexOf('/') + 1)) === 'profile') {
            this._appService.currentTab.next('my_project');
            this.router.navigate(['profile/my_project']);
        }

      this.socket.on('multipleSession', (data) => {
          this.alertService.show('error', 'Multiple Session Detected.');
      });

      // Listen to tab change
      this.tabSubscription = this._appService.currentTab.subscribe(TAB => this.tab = TAB);

      // To identify tab If user writes url manually
      let url = this.router.url.slice(this.router.url.lastIndexOf('/') + 1);
      if (url === 'image_settings' || url === 'label_settings' || url === 'view_image') {
          url = 'project_settings';
      }
      this._appService.currentTab.next(url);
  }

  // Changing the route
  changeTab(tab) {
      this.tab = tab;
      this._appService.currentTab.next(tab);
      this.router.navigate(['freelancer/profile/' + tab]);
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

  logOut() {
      this.alertService.show('warn', 'Do you want to log out ?');

      this.alertService.positiveCallback = (() => {
          this.alertService.hide();

          this._appService.doLogOut().subscribe((res) => {
              this._appService.tempData = {};
              this._appService.isLogin.next(false);

              localStorage.clear();

              this.socket.emit('logout');

              this.router.navigateByUrl('/login');
          }, (err) => {
              this.errorHandler(err, 'Error while logging out the user.');
          });
      });
  }

  ngOnDestroy() {
      // Unsubscribe observables, if any
      this.tabSubscription.unsubscribe();
  }

}
