import { Component, OnInit, Input } from '@angular/core';
import { AppService } from '../app-service.service';
import { NotificationsService } from 'angular2-notifications';
import { LoggerService } from '../logger.service';
import { Title } from '@angular/platform-browser';

@Component({
    selector: 'app-change-password',
    templateUrl: './change-password.component.html',
    styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {

    // @Input() tab: string;
    // @Input() user;
    user;
    is_Edit;

    passwordMasking = [
        {
            type: 'password',
            class: 'fa fa-eye-slash password-masking-icon',
            show: false
        },
        {
            type: 'password',
            class: 'fa fa-eye-slash password-masking-icon',
            show: false
        },
        {
            type: 'password',
            class: 'fa fa-eye-slash password-masking-icon',
            show: false
        }
    ]

    constructor(private loggerService: LoggerService, private _appService: AppService, private _notify: NotificationsService, private titleService: Title) {
        this.is_Edit = false
    }

    ngOnInit() {
        this.titleService.setTitle( 'Change Password | OCLAVI' );
        this.user = JSON.parse(localStorage.getItem('user'));
    }

    edit() {
        this.is_Edit = true;
    }

    oldPassword = '';
    newPassword = '';
    confirmPassword = '';

    toggle(index) {
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

    changePassword() {

        if (this.oldPassword == '' ) {
            this._notify.error(null, 'Enter enter old password')
            return;
        }

         if (this.newPassword == '' || this.newPassword.length < 6) {
            this._notify.error(null, 'Enter enter min 6 apha-numeric new password')
            return;
        }

        if (this.oldPassword != '' && this.newPassword != '' && this.confirmPassword != '') {
            if (this.newPassword == this.confirmPassword) {
                this._notify.info(null, 'Please wait..', {timeOut: 1000});
                var data = {
                    'oldPassword': this.oldPassword,
                    'newPassword': this.newPassword
                };
                this._appService.updatePassword(data).subscribe(data => {
                    this._notify.success("Password updated successfully");
                    this.oldPassword = '';
                    this.newPassword = '';
                    this.confirmPassword = '';
                }, err => {
                    this._notify.error(null, err);
                })
            } else {
                this._notify.error(null, "New password and confirm password is not same");
            }
        } else {
            this._notify.error(null, "Please enter input values");
        }

    }
}
