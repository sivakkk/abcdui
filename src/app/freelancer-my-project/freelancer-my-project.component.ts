import { Component, OnInit, Input, Output, EventEmitter, trigger, transition, style, animate } from '@angular/core';
import { environment } from '../../environments/environment';
import { AlertService } from '../alert.service';
import { ProjectService } from '../project.service';
import { NotificationsService } from 'angular2-notifications';
import { Router } from '@angular/router';
import { AppService } from '../app-service.service';
import { Title } from '@angular/platform-browser';
import { Http, RequestOptions } from '@angular/http';
import { LoaderService } from '../loader.service';

declare var $: any;

@Component({
  selector: 'app-freelancer-my-project',
  animations: [
      trigger(
          'myAnimation',
          [
              transition(
                  ':enter', [
                      style({ transform: 'translateX(100%)', opacity: 0 }),
                      animate('200ms', style({ transform: 'translateX(0)', opacity: 1 }))
                  ]
              ),
              transition(
                  ':leave', [
                      style({ transform: 'translateX(0)', 'opacity': 1 }),
                      animate('200ms', style({ transform: 'translateX(100%)', opacity: 0 }))
                  ]
              )
          ]
      )
  ],
  templateUrl: './freelancer-my-project.component.html',
  styleUrls: ['./freelancer-my-project.component.scss']
})
export class FreelancerMyProjectComponent implements OnInit {

    sortingMethod: string;
    gridViewMode = true;
    searchTerm: string;
    user: any;
    environment;
    httpOptions;
    Math: Math = Math;
    totalProjects = 0;
    hasTrainingProject: boolean;

    constructor(private alertService: AlertService, private projectService: ProjectService,
        private titleService: Title, private notify: NotificationsService, private router: Router,
        private appService: AppService, private http: Http, private loadingService: LoaderService) {
    }

    ngOnInit() {
        this.titleService.setTitle('My Project | OCLAVI');
        this.searchTerm = '';
        this.sortingMethod = 'None';
        this.environment = environment;
        this.httpOptions = new RequestOptions({ withCredentials: true });

        this.user = JSON.parse(localStorage.getItem('user'));
        this.getProjectDetails();
    }

    changeViewMode() {
        this.gridViewMode = !this.gridViewMode;
    }

    changeSortingMethod(method) {
        this.sortingMethod = method;
    }

    changeTab(tab, projectId) {
        this.projectService.currentProject = projectId;
        this.appService.currentTab.next(tab);   // Emit this when changing tab So it will correctly show tab name in header
        this.router.navigate([`profile/projects/${projectId}`]);
    }

    getProjectDetails() {
        this.loadingService.show('Fetching your projects...');

        this.projectService.getFreelancerProjects().subscribe(res => {
            this.user.PROJECTS = res.projects;

            for (let key in res.projects) {
                this.totalProjects++;
                if (res.projects[key].STATUS === 'TRAINING') {
                    this.hasTrainingProject = true; // Setting this flag so it will be easy to show training project and other projects seperately
                }
            }

            this.notify.success('Projects fetched');
            this.loadingService.hide();
        }, err => {
            this.errorHandler(err, 'Error occured while fetching projects');
        });
    }


  classify(projectId) {
        this.loadingService.show('Checking our database...');

        this.http.post(environment.oclaviServer + 'classify', { projectId: projectId }, this.httpOptions)
            .subscribe(res => {
                this.router.navigate([res.json().redirect]);

                this.loadingService.hide();
            }, err => {
                this.errorHandler(err, 'Some unexpected error has occured.');
            });

    }


    errorHandler(response, message) {
        //general purpose error handler
        this.loadingService.hide();

        if (response.status == 401)
            this.router.navigate(['login']);

        else if (Object.keys(response).length > 0) {
            var text = response.json().message;

            if (text != '')
                this.notify.error(null, text);

            else
                this.notify.error(null, message);
        }

        else
            this.notify.error(null, message);
    }

}
