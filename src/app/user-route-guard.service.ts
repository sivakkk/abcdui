import { Router, CanActivateChild } from '@angular/router';
import { Injectable } from '@angular/core';
import { Http, RequestOptions } from '@angular/http';
import { environment } from '../environments/environment';
import { AppService } from './app-service.service';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class UserRouteGuard implements CanActivateChild {
    // To make sure freelancer won't be able to access routes
    constructor(private http: Http, private router: Router, private _appService: AppService) { }

    canActivateChild(): Observable<boolean> {

        if (this._appService.tempData._id && (this._appService.tempData.USER_TYPE === environment.USER_TYPE.ADMIN.NAME || this._appService.tempData.USER_TYPE === environment.USER_TYPE.SELF.NAME
           || this._appService.tempData.USER_TYPE === environment.USER_TYPE.STUDENT_SELF.NAME || this._appService.tempData.USER_TYPE === environment.USER_TYPE.STUDENT_ADMIN.NAME
           || this._appService.tempData.USER_TYPE === environment.USER_TYPE.TEAM.NAME)) {
            return Observable.of(true);
        } else {
            const httpOptions = new RequestOptions({ withCredentials: true });

            return this.http.get(environment.oclaviServer + 'me/isAuthenticated', httpOptions).map(res => {
                const body = JSON.parse(res['_body']);

                if (body.user && (body.user.USER_TYPE === environment.USER_TYPE.ADMIN.NAME || body.user.USER_TYPE === environment.USER_TYPE.SELF.NAME
                    || body.user.USER_TYPE === environment.USER_TYPE.STUDENT_SELF.NAME || body.user.USER_TYPE === environment.USER_TYPE.STUDENT_ADMIN.NAME 
                    || body.user.USER_TYPE === environment.USER_TYPE.TEAM.NAME)) {
                    return true;
                }

                this.router.navigate(['/']);
                return false;
            }).catch(err => {
                this.router.navigate(['/']);
                return Observable.of(false);
            });
        }
    }
}
