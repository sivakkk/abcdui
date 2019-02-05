import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { NotificationsService } from 'angular2-notifications';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import { Http, Response, RequestOptions, Headers, ResponseContentType } from '@angular/http';

declare var $: any;

@Injectable()
export class ConfirmPasswordService {
    public subject = new Subject<Boolean>();
    passwordMatchCallback: any;
    httpOptions: RequestOptions;

    constructor(private http: Http, private notify: NotificationsService, private router: Router, private route: ActivatedRoute) {
        this.subject.next(false);
    }

    public confirmPressed = (() => {
        this.httpOptions = new RequestOptions({ withCredentials: true });

        let body = {
            password: $('#confirmPasswordContentInput').val()
        }

        this.http.post(environment.oclaviServer + 'confirmPassword', body, this.httpOptions).subscribe((res) => {
            this.subject.next(false);

            res = res.json();

            if (res['passwordMatch']) {
                this.notify.success('Your password has been matched');

                this.passwordMatchCallback();
            }

            else
                this.notify.error('Your password didn\'t match.');
        }, err => {
            this.subject.next(false);

            this.errorHandler(err, 'Error confirming your password');
        });
    });

    public cancelPressed = (() => {
        console.log('cancelPressed');

        this.subject.next(false);
    });

    show(callback) {
        this.subject.next(true);

        this.passwordMatchCallback = callback;
    }

    errorHandler(response, message) {
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

}
