import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { Router, ActivatedRoute } from '@angular/router';
import { LoaderService } from './loader.service';
import { LoggerService } from './logger.service';
import { environment } from '../environments/environment';
import { CookieService } from 'angular2-cookie/core';
import { Subject } from 'rxjs/Subject';

declare var io: any;

@Injectable()
export class AppService {
    currentTab: Subject<any> = new Subject();
    userAvatar: Subject<any> = new Subject();
    userDetails = [];
    options = new RequestOptions({ withCredentials: true });
    isLogin: Subject<any> = new Subject();
    socket: any;

    public tempData: any = {};

    constructor(private http: Http, private router: Router, private route: ActivatedRoute, private loadingService: LoaderService, private loggerService: LoggerService, private _cookieService: CookieService) { }

    getUser(): Observable<any> {
        return this.http.get(environment.oclaviServer + 'me', this.options)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
    }

    doLogin(user): Observable<any> {
        return this.http.post(environment.oclaviServer + 'login', user, this.options)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'))
    }

    doLogOut(): Observable<any> {
        return this.http.get(environment.oclaviServer + 'logout', this.options)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'))
    }

    upload(formData) {
        return this.http.post(environment.oclaviServer + 'upload/avatar', formData, this.options)
            .map((res: Response) => {
                var a = res.json();
                var imgUrl = a.avatar_id;
                this.userAvatar.next(imgUrl);
                return imgUrl;
            })
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'))
    }

    errorHandler(response) {
        if (response.status == 401)
            this.router.navigate(['login']);

        else
            this.loggerService.log(response);
    }

    doExport(exportData) {
        return this.http.post(environment.oclaviServer + 'export', exportData, this.options)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'))
    }

    forgetPassword(data) {
        return this.http.post(environment.oclaviServer + 'do/forgetpassword', data, this.options)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().message || 'Server error'))
    }


    connectUs(data): Observable<any> {
        return this.http.post(environment.oclaviServer + 'connect/oclavi', data, this.options)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().message || 'Server error'))
    }

    updatePassword(userData): Observable<any> {
        return this.http.post(environment.oclaviServer + 'update/password', userData, this.options)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().message || 'Server error'))
    }

    updateName(userData): Observable<any> {
        return this.http.post(environment.oclaviServer + 'update/name', userData, this.options)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().message || 'Server error'));
    }

    deleteAvatar(): Observable<any> {
        return this.http.get(environment.oclaviServer + 'delete/avatar', this.options)
            .map((res: Response) => res.json)
            .catch((error: any) => Observable.throw(error.json().message || 'Server error'));
    }

    getCookies(key) {
        return this._cookieService.get(key);
    }

    setCookies(key, value) {
        this._cookieService.put(key, value);
    }

    getSocket() {
        if (!this.socket)
            this.setSocket();

        return this.socket;
    }

    setSocket() {
        let options = {
            reconnection: true,
            reconnectionDelay: 500,
            reconnectionAttempts: 10
        }
        this.socket = io(environment.socketIOServer, options);
    }
}
