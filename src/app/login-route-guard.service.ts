import { Router, CanActivate } from '@angular/router';
import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs/Rx';

@Injectable()
export class LoginRouteGuard implements CanActivate {

    constructor(private http: Http, private router: Router) { }

    canActivate(): Observable<boolean> {
        var httpOptions = new RequestOptions({ withCredentials: true });

        return this.http.get(environment.oclaviServer + 'me/isAuthenticated', httpOptions).map(res => {
            var data = res;
            var body = JSON.parse(res['_body']);
            this.router.navigate([body.redirect]);
            return false;
        }).catch(err => {
            return Observable.of(true);
        });
    }
}
