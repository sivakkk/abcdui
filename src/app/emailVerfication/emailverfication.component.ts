import { Component, OnInit, NgZone } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { Router, ActivatedRoute } from '@angular/router';
import { LoaderService } from '../loader.service';
import { LoggerService } from '../logger.service';
import { environment } from '../../environments/environment';
import { NotificationsService } from 'angular2-notifications';
import { AppService } from '../app-service.service';
import { Title, Meta } from '@angular/platform-browser';

declare var Razorpay: any;
declare var ProductTour: any;
declare var setTimeout: any;

@Component({
    selector: 'app-emailverfication',
    templateUrl: './emailverfication.component.html',
    styleUrls: ['./emailverfication.component.scss']
})
export class emailVerficationComponent implements OnInit {
    httpOptions: RequestOptions;
    // price: Number;
    tempData;

    constructor(private http: Http, private router: Router, private route: ActivatedRoute, private notify: NotificationsService,
        private loadingService: LoaderService, private _ngZone: NgZone, private loggerService: LoggerService, private _appService: AppService, meta: Meta, titleService: Title) {
            titleService.setTitle( 'Email Verification | OCLAVI' );
            meta.addTags([
                { name: 'author', content: 'Carabiner Technologies Private Limited'}
            ]);
            this.tempData = this._appService.tempData;
            console.log(this.tempData);
    }

    ngOnInit() {
        this.httpOptions = new RequestOptions({ withCredentials: true });
   
       
    }

    resend() {
         this.loadingService.show('Resending ...');


        var emailAddress = this.tempData.EMAIL_ID || this.tempData.email;
        if(!emailAddress) {
             this._ngZone.run(() => this.router.navigate(['/']));
             return;
        }

        var data = {
            email : emailAddress
        }
        this.http.post(environment.oclaviServer + 'resend/verify-email', data, this.httpOptions).subscribe(res => {
                this.loadingService.hide();
                this.notify.success(null, "Verifiation email sent .");
            }, err => {
                this.loadingService.hide();

                this.notify.error(null, 'Server Error');

                this.loggerService.log(err);
        });
    }

    

}
