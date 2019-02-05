import { Component, OnInit, Input, ViewEncapsulation, NgZone, Output, EventEmitter, Sanitizer } from '@angular/core';
import { Http, Response, RequestOptions, Headers, ResponseContentType } from '@angular/http';
import { Router, ActivatedRoute } from '@angular/router';
import { AppService } from '../app-service.service';
import { LoggerService } from '../logger.service';
import { LoaderService } from '../loader.service';
import { AlertService } from '../alert.service';
import { NotificationsService } from 'angular2-notifications';
import { Title, DomSanitizer } from '@angular/platform-browser';
import { environment } from '../../environments/environment';

@Component({
    selector: 'app-how-to-work',
    templateUrl: './how-to-work.component.html',
    styleUrls: ['./how-to-work.component.scss']
})
export class HowToWorkComponent implements OnInit {

    httpOptions: RequestOptions;
    channelVideos = [];
    session;

    constructor(private http: Http,
        private router: Router,
        private route: ActivatedRoute,
        private _appService: AppService,
        private loadingService: LoaderService,
        private notify: NotificationsService,
        private alertService: AlertService,
        private loggerService: LoggerService,
        private _ngZone: NgZone,
        private titleService: Title,
        private sanitizer: DomSanitizer) {
    }


    ngOnInit() {
        this.session = JSON.parse(localStorage.getItem('user'));

        if (this.session.USER_TYPE == environment.USER_TYPE.TEAM.NAME) {
            this.router.navigate(['profile']);
        }

        this.titleService.setTitle('How To Work | OCLAVI');

        this.httpOptions = new RequestOptions({ withCredentials: true });

        this.loadingService.show('Fetching Details...');

        this.http.get(environment.oclaviServer + 'getChannelVideos', this.httpOptions)
            .subscribe((res: any) => {
                if (res) {
                    this.channelVideos = res.json().videoCollection;
                }
                this.loadingService.hide();

            }, err => {
                this.notify.error(null, 'Error while fetching videos...');
                this.loadingService.hide();
            });

    }

    byPassUrlTrust(videoUrl) {
        return this.sanitizer.bypassSecurityTrustResourceUrl(videoUrl);
    }
}