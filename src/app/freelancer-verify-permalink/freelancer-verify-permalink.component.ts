import { Component, OnInit } from '@angular/core';
import { Http, RequestOptions } from '@angular/http';
import { Router, ActivatedRoute } from '@angular/router';
import { LoaderService } from '../loader.service';
import { NotificationsService } from 'angular2-notifications';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-freelancer-verify-permalink',
  templateUrl: './freelancer-verify-permalink.component.html',
  styleUrls: ['./freelancer-verify-permalink.component.scss']
})
export class FreelancerVerifyPermalinkComponent implements OnInit {
  httpOptions: any;
  showComponent = false;

  constructor(private http: Http, private router: Router, private route: ActivatedRoute,
    private loadingService: LoaderService, private notify: NotificationsService) { }

  ngOnInit() {
    // To verify PERMALINK for ACCEPTING PROJECT by freelncer
    this.loadingService.show('Assigning project');
    this.httpOptions = new RequestOptions({ withCredentials: true });

    this.route.params.subscribe(params => {
      const data = {
        PROJECT_ID: params['projectId'],
        PERMALINK: params['permalink'],
        FREELANCER_OID: params['freelancerId']
      };

      this.http.post(environment.oclaviServer + 'freelancer/verifyPermalink', data, this.httpOptions).subscribe(res => {
          this.loadingService.hide();
          this.notify.success('A project is assigned to you.');

          this.router.navigate(['/freelancer/login']);
      }, (err) => {
          this.showComponent = true;

          this.loadingService.hide();

          var body = JSON.parse(err._body);

          if (body.message != '')
              this.notify.error(body.message);

          else
              this.notify.error('Error assigning a new project');
      });
    });
  }

}
