import { Component, OnInit, Input } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { Router, ActivatedRoute } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { AppService } from '../app-service.service';
import { environment } from '../../environments/environment';
import { LoaderService } from '../loader.service';
import { AdminDashboardUserChartComponent } from '../admin-dashboard-user-chart/admin-dashboard-user-chart.component';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss', './progress-circle.css']
})
export class AdminDashboardComponent implements OnInit {
  @Input() tab: string;
  @Input() user;
  teamData: any;
  localUser : any;
  httpOptions: RequestOptions;
  teamDetails: any;
  date: Date;
  images: any;

  constructor(private appService: AppService, private http: Http, private router: Router,
    private route: ActivatedRoute, private loadingService: LoaderService) { }

  ngOnInit() {
    this.date = new Date();
    this.httpOptions = new RequestOptions({ withCredentials: true });
    this.getTeamDetails();
    this.images = {};

    this.localUser = JSON.parse(localStorage.getItem('user'))
  }

  getTeamDetails(){
    this.httpOptions = new RequestOptions({withCredentials: true});
    this.loadingService.show('Please wait...');
    this.http.post(environment.oclaviServer + 'admin-dashboard', {}, this.httpOptions).subscribe(res => {
      this.teamDetails = res.json();
      console.log(this.teamDetails);

      if(this.teamDetails.total_images.length > 0 && this.teamDetails.distinct.length > 0){
        this.images['total_images'] = this.teamDetails.total_images[0].TOTAL_IMAGES;
        this.images['distinct'] = this.teamDetails.distinct[0].DISTINCT;
      }else {
        this.images = new Array();
      }
      this.teamData = this.teamDetails.teamData;
      this.teamDetails = this.teamDetails.users;
      this.loadingService.hide();
    })


  }

}
