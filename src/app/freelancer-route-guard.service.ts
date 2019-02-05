import { Router, CanActivateChild } from '@angular/router';
import { Injectable } from '@angular/core';
import { Http, RequestOptions } from '@angular/http';
import { environment } from '../environments/environment';
import { AppService } from './app-service.service';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class FreelancerRouteGuard implements CanActivateChild {
    // To make sure that routes will be only activated for freelancer
    constructor(private http: Http, private router: Router, private _appService: AppService) { }

    canActivateChild(): Observable<boolean> {

        if (this._appService.tempData._id && this._appService.tempData.USER_TYPE === environment.USER_TYPE.FREELANCER.NAME) {
            return Observable.of(true);
        } else {
            const httpOptions = new RequestOptions({ withCredentials: true });

            return this.http.get(environment.oclaviServer + 'me/isAuthenticated', httpOptions).map(res => {
                const body = JSON.parse(res['_body']);

                if (body.user && body.user.USER_TYPE === environment.USER_TYPE.FREELANCER.NAME) {
                    return true;
                }

                this.router.navigate(['/freelancer/login']);
                return false;
            }).catch(err => {
                this.router.navigate(['/freelancer/login']);
                return Observable.of(false);
            });
        }
    }
}
