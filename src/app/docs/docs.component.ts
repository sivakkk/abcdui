import { Component, OnInit, ViewEncapsulation, Input, ViewChild } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { Router, ActivatedRoute } from '@angular/router';
import { AppService } from '../app-service.service';
import { environment } from '../../environments/environment';
import { NotificationsService } from 'angular2-notifications';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-docs',
  templateUrl: './docs.component.html',
  styleUrls: ['./docs.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DocsComponent implements OnInit {
  // @Input() tab: string;
  // @Input() user;
  user;
  httpOptions: RequestOptions;

  constructor(private appService: AppService, private http: Http, private router: Router,
    private route: ActivatedRoute, private notify: NotificationsService, private titleService: Title) { }

  ngOnInit() {
    this.httpOptions = new RequestOptions({ withCredentials: true });
    this.titleService.setTitle( 'Get Started - OCLAVI' );
    this.user = JSON.parse(localStorage.getItem('user'));

    if (this.user.USER_TYPE == environment.USER_TYPE.TEAM.NAME) {
      this.router.navigate(['profile']);
    }
  }

}
