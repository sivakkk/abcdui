import { Component, OnInit, Input, NgZone, ViewChild } from '@angular/core';
import { AppService } from '../app-service.service';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { AlertService } from '../alert.service';
import { LoaderService } from '../loader.service';
import { LoggerService } from '../logger.service';
import { NotificationsService } from 'angular2-notifications';
import { Croppie } from 'croppie';
import { Title, Meta } from '@angular/platform-browser';

declare var Razorpay: any;
declare var $: any;

@Component({
  selector: 'app-profile-settings',
  templateUrl: './profile-settings.component.html',
  styleUrls: ['./profile-settings.component.scss']
})
export class ProfileSettingsComponent implements OnInit {

    // @Input() tab: string;
    // @Input() user;
    user;
    settingsTab: string;
    currentStatus: any;
    readonly STATUS_INITIAL = 0;
    readonly STATUS_SAVING = 1;
    readonly STATUS_SUCCESS = 2;
    readonly STATUS_FAILED = 3;
    environment: any;

    imageName: any;
    @ViewChild('croppingImg') imageCropper;
    croppie: Croppie;

    editName: Boolean = false;
    userName: string;

    httpOptions: RequestOptions;
    session: any;

    constructor(private _appService: AppService, private router: Router, private loadingService: LoaderService,
        private alertService: AlertService, private notify: NotificationsService,
        private loggerService: LoggerService, private http: Http, private _ngZone: NgZone,
        meta: Meta, titleService: Title) {

            titleService.setTitle( 'Profile Settings | OCLAVI' );
            meta.addTags([
                { name: 'author', content: 'Carabiner Technologies Private Limited'}
            ]);

            this.currentStatus = this.STATUS_INITIAL;
            this.environment = environment;
    }

    ngOnInit() {
        this.settingsTab = 'general';   // Setting 'general' tab as default tab in profile settings
        this.session = JSON.parse(localStorage.getItem('user'));
        this.user = this.session;
        this.httpOptions = new RequestOptions({ withCredentials: true });
    }

    changeSettingsTab(tab) {
        this.settingsTab = tab;
    }

    /**************************** SELECT PROFILE PIC, CROP AND SAVE *********************/
    selectImage(event) {
        const file = event.target.files[0];
        if (!file) {
            return;
        }
        let rawImg;
        const reader = new FileReader();
        reader.onload = (e: any) => {
            $('#imageCroppingModal').modal('show');
            rawImg = e.target.result;
        };
        this.imageName = file.name;
        reader.readAsDataURL(file);
        this.croppie = new Croppie(this.imageCropper.nativeElement, {   // Setting croppie with options
            boundary: { width: 225, height: 225 },
            enableZoom: true,
            enforceBoundary: true,
            showZoomer: false,
            viewport: { width: 125, height: 125, type: 'circle' }
        });
        $('#imageCroppingModal').on('shown.bs.modal', () => {
            this.croppie.bind({
                url: rawImg
            });
        });
    }

    // Cancel changing name or profile picture
    cancel(propertyChanging) {
        if (propertyChanging === 'image') {
            $('#imageCroppingModal').modal('hide');
            this.croppie.destroy();
            return;
        }
        if (propertyChanging === 'name') {
            this.editName = false;
            this.userName = '';
            return;
        }
    }

    // Executes when user selects profile picture
    filesChange() {
        const fieldName = 'avatar';
        const fileName = this.imageName;
        let imageBlob;
        const formData = new FormData();
        this.croppie.result('blob', 'viewport', 'jpeg', 1, true).then(function(result) {
            imageBlob = result;
        }).then(() => {
            formData.append(fieldName, imageBlob, fileName);
            this.croppie.destroy();
            this.save(formData);
        });
    }

    // save profile picture
    save(formData: FormData) {
        this.currentStatus = this.STATUS_SAVING;
        $('#imageCroppingModal').modal('hide');
        this.notify.info('Updating Profile picture, please wait...');
        this._appService.upload(formData).subscribe(x => {

            if (x != undefined) {
                this.user['USER_AVATAR'] = x;
                localStorage.setItem('user', JSON.stringify(this.user));
                this.currentStatus = this.STATUS_SUCCESS;
                this.notify.success('Profile picture updated.');
            }
        }, err => {
            console.log(err);
            this.notify.error(null, err);
            this.currentStatus = this.STATUS_FAILED;
        });
    }

    /****************************** CHANGE NAME AND SAVE ********************************/
    edit() {
        // this.alertService.show('error', 'Are you sure you want to Change your awesome name?');
        this.editName = true;
    }

    saveName() {
        if (this.userName == '') {
            this.notify.error(null, `Oops!!!, We don't save a blank name.`);
            return;
        }
        if (this.userName != '') {
            this.currentStatus = this.STATUS_SAVING;
            this.notify.info('Updating Name, please wait...');
            const data = { name: this.userName };
            this._appService.updateName(data).subscribe( response => {
                this.user['NAME'] = response.NAME;
                this.editName = false;
                this.notify.success('Name updated successfully');
                localStorage.setItem('user', JSON.stringify(this.user));
                this.currentStatus = this.STATUS_SUCCESS;
            }, err => {
                this.notify.error(null, err);
                this.currentStatus = this.STATUS_FAILED;
            });
        }
    }

    /****************************** Delete User Avatar ********************************/
    deleteUserAvatar () {
       this.alertService.show('warn', 'Are you sure you want to delete Profile Picture?');

        this.alertService.positiveCallback = (() => {
            this.alertService.hide();
            this.currentStatus = this.STATUS_SAVING;
            this.notify.info('Deleting Profile picture, please wait...');
            this._appService.deleteAvatar()
                .subscribe(response => {
                    console.log(this.user['USER_AVA']);
                    this.user['USER_AVA'] = response.avatar;
                    this.notify.success('Profile picture deleted!!');
                    localStorage.setItem('user', JSON.stringify(this.user));
                    this.currentStatus = this.STATUS_SUCCESS;
                }, err => {
                    this.notify.error(null, err);
                    this.currentStatus = this.STATUS_FAILED;
                });
        });
    }
    
    /****************************** accountSwitch ********************************/
    accountSwitch() {
        var fromAccountType, toAccountType;
        if (this.user.USER_TYPE == environment.USER_TYPE.STUDENT_SELF.NAME) {
            fromAccountType = environment.USER_TYPE.STUDENT_SELF.NAME
            toAccountType = environment.USER_TYPE.STUDENT_ADMIN.NAME
        } else if (this.user.USER_TYPE == environment.USER_TYPE.STUDENT_ADMIN.NAME) {
            fromAccountType = environment.USER_TYPE.STUDENT_ADMIN.NAME
            toAccountType = environment.USER_TYPE.STUDENT_SELF.NAME
        }

        this.alertService.show('warn', '<p>This would switch your account from ' + fromAccountType + ' to ' + toAccountType +' .</p><p>Do you want to continue?</p>');

        this.alertService.positiveCallback =(() => {
            this.alertService.hide();
            this.loadingService.show('Switching the account from ' + fromAccountType + ' to ' + toAccountType);
            var body = {
                _id: this.user._id,
                USER_TYPE: this.user.USER_TYPE
            };
            this.httpOptions = new RequestOptions({ withCredentials: true });
            this.http.post(environment.oclaviServer + 'accountSwitch', body, this.httpOptions).subscribe(res => {
                this.loadingService.hide();
                console.log(this.session.USER_TYPE)
                this.session.USER_TYPE = toAccountType;
                this.notify.success('Your account is now swtiched to ' + toAccountType);
                localStorage.setItem('user', JSON.stringify(this.session));
            }, err => {
                this.loadingService.hide();
                this.notify.error('Error while verifying switching your account typ.');
                this.loggerService.log(err);
            });
        })
    }

    /****************************** DowngradeAccount ********************************/
    accountDowngrade()
    {
        var fromAccountType, toAccountType;
        if (this.user.USER_TYPE == environment.USER_TYPE.SELF.NAME) {
            fromAccountType = environment.USER_TYPE.SELF.NAME
            toAccountType = environment.USER_TYPE.STUDENT_SELF.NAME
        } else if (this.user.USER_TYPE == environment.USER_TYPE.ADMIN.NAME) {
            fromAccountType = environment.USER_TYPE.ADMIN.NAME
            toAccountType = environment.USER_TYPE.STUDENT_ADMIN.NAME
        }
        this.alertService.show('warn', '<p>This would downgrade your account from ' + fromAccountType + ' to ' + toAccountType +' .</p><p>Do you want to continue?</p>');
        this.alertService.positiveCallback =(() => {
            this.alertService.hide();
            this.loadingService.show('Downgrade the account from ' + fromAccountType + ' to ' + toAccountType);
            var body = {
                _id: this.user._id,
                USER_TYPE: this.user.USER_TYPE
            };
            this.httpOptions = new RequestOptions({ withCredentials: true });
            this.http.post(environment.oclaviServer + 'accountDowngrade', body, this.httpOptions).subscribe(res => {
                this.loadingService.hide();
                console.log(this.session.USER_TYPE)
                this.session.USER_TYPE = toAccountType;
                this.notify.success('Your account is now downgraded to ' + toAccountType);
                localStorage.setItem('user', JSON.stringify(this.session));
            }, err => {
                this.loadingService.hide();
                this.notify.error('Error while verifying downgrading your account typ.');
                this.loggerService.log(err);
            });
    });
}
/******************************DeleteAccount ********************************/
deleteAccount()
{
    this.alertService.show('warn', 'Are you sure you want to delete your account?');
    this.alertService.positiveCallback =(() => {
        this.alertService.hide();
        this.loadingService.show('Deleting your account');
        var body = {
            _id: this.user._id,
            USER_TYPE: this.user.USER_TYPE
        };
        this.httpOptions = new RequestOptions({ withCredentials: true });
        this.http.post(environment.oclaviServer + 'deleteAccount', body, this.httpOptions).subscribe(res => {
            this.loadingService.hide();
            console.log(this.session.USER_TYPE)
            //this.session.USER_TYPE = toAccountType;
            this.notify.success('Your account is deleted' );
            localStorage.setItem('user', JSON.stringify(this.session));
            this.router.navigate(['/landing-page']);
        }, err => {
            this.loadingService.hide();
            this.notify.error('Error while deleting account');
            this.loggerService.log(err);
        });
    })
}


    regenerateAPI_KEY() {
        if (this.user.USER_TYPE != environment.USER_TYPE.TEAM.NAME) {
            this.alertService.show('warn', 'Do you want to regenerate API key?');

            this.alertService.positiveCallback = (() => {
                this.alertService.hide();
                this.loadingService.show('Regenerating a new API key...');

                this.http.post(environment.oclaviServer + 'regenerateAPI_KEY', {}, this.httpOptions)
                .subscribe(res => {
                    this.loadingService.hide();
                    this.notify.success('Successfully regenerated API key.');

                    this.user.API_KEY = res.json().API_KEY;

                    localStorage.setItem('user', JSON.stringify(this.user));

                }, err => {
                    this.errorHandler(err, 'Error while regenerating API key.');
                });
            });
        }
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

}
