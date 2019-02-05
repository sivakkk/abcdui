import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Router, Event, NavigationEnd } from '@angular/router';
import { environment } from '../../environments/environment';
import { Http, RequestOptions } from '@angular/http';
import { AppService } from '../app-service.service';
import { DomSanitizer } from '@angular/platform-browser';

declare var $: any;

@Component({
  selector: 'app-marketing',
  templateUrl: './marketing.component.html',
  styleUrls: ['./marketing.component.scss']
})
export class MarketingComponent implements OnInit, AfterViewInit, OnDestroy {
  routerSubscription;
  userLoginSubscription;
  url;
  httpOptions;
  userData;
  flyer_details = [];
  currentFlyerIndex: number;
  FLYER_DISPLAYED_START_DATE: any;
  FLYER_CLICKED_STATUS: any;

  constructor(private router: Router, private http: Http,
    private appService: AppService, private _sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.httpOptions = new RequestOptions({ withCredentials: true });

    this.routerSubscription = this.router.events.subscribe((event: Event) => {
                                if (event instanceof NavigationEnd) {
                                  this.url = event.urlAfterRedirects;

                                  if (!this.userData || !this.userData._id) {
                                    this.userData = this.appService.tempData;
                                  }

                                  this.getMarketingFlyers();
                                }
                              });

      // After log out, delete userData
      this.userLoginSubscription = this.appService.isLogin.subscribe((isUserLoggedIn: boolean) => {
        if (!isUserLoggedIn) {
          this.userData = {};
        }
      });

    this.userData = JSON.parse(localStorage.getItem('user'));
  }


  getMarketingFlyers () {
    if (this.url && this.url !== '/profile') {
      let user: any = '';

      if (this.userData._id) {
        user = this.userData._id;
      }

      this.http.get(environment.oclaviServer + `getMarketingFlyers?user=${user}&route=${this.url}`, this.httpOptions)
        .map(res => res.json())
        .subscribe(res => {
          if (res.isAdAvailable) {
            this.flyer_details = res.ad_details;
            this.currentFlyerIndex = 0;
            this.showMarketingFlyers();
          }
        }, err => console.log(err));
    }
  }


  showMarketingFlyers() {
    if (this.flyer_details.length !== 0 && this.currentFlyerIndex < this.flyer_details.length) {
      if (this.flyer_details[this.currentFlyerIndex].ADVT_DISPLAY_TYPE === 'HTML') {
        this.flyer_details[this.currentFlyerIndex].ADVT_DISPLAY_HTML = this._sanitizer.bypassSecurityTrustHtml(this.flyer_details[this.currentFlyerIndex].ADVT_DISPLAY_HTML);
      }

      $('#flyerModal').modal('show');
      this.FLYER_DISPLAYED_START_DATE = Date.now();
    }

    else {
      this.flyer_details = [];
    }
  }


  saveMarketingFlyersLogs () {
    if (this.userData && this.userData._id) {
      const advt_close_date = Date.now();

      const data = {
        ADVT_OID: this.flyer_details[this.currentFlyerIndex]._id,
        USER_OID: this.userData._id,
        ADVT_DISPLAYED_START_DATE: this.FLYER_DISPLAYED_START_DATE,
        ADVT_DISPLAYED_END_DATE: advt_close_date,
        ADVT_DISPLAYED_DURATION: advt_close_date - this.FLYER_DISPLAYED_START_DATE,
        ADVT_CLICKED_STATUS: 'CLICKED',
        ADVT_CLICKED_DATE: advt_close_date
      };

      this.http.post(environment.oclaviServer + 'saveMarketingFlyersLogs', data, this.httpOptions)
        .map(res => res.json())
        .subscribe(res => console.log(res.success)
        , err => console.log(err));
    }

    setTimeout(() => {
      this.currentFlyerIndex += 1;
      this.FLYER_DISPLAYED_START_DATE = null;
      this.showMarketingFlyers();
    }, environment.displayAdDelay);
  }


  ngAfterViewInit() {
    $('#flyer-component').on('click', () => {
      $('#flyerModal').modal('hide');
    });

    $('#flyerModal').on('hidden.bs.modal', () => {
      this.saveMarketingFlyersLogs();
    });
  }


  ngOnDestroy() {
    this.routerSubscription.unsubscribe();
    this.userLoginSubscription.unsubscribe();
  }

}
