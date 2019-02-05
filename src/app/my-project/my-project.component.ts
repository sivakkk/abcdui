import { Component, OnInit, Input, Output, EventEmitter, trigger, transition, style, animate } from '@angular/core';
import { Http, Response, RequestOptions, Headers, ResponseContentType } from '@angular/http';
import { environment } from '../../environments/environment';
import { AlertService } from '../alert.service';
import { ProjectService } from '../project.service';
import { NotificationsService } from 'angular2-notifications';
import { Router } from '@angular/router';
import { AppService } from '../app-service.service';
import { Title } from '@angular/platform-browser';

declare var $: any;

@Component({
    selector: 'app-my-project',
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
    templateUrl: './my-project.component.html',
    styleUrls: ['./my-project.component.scss']
})
export class MyProjectComponent implements OnInit {
    // @Input() tab: string;
    @Output() goToProjectSettings: EventEmitter<string> = new EventEmitter();
    sortingMethod: string;
    gridViewMode = true;
    searchTerm: string;
    user: any;
    whatsNewImage: any;
    activatedStorageTypes = [];
    annotateByOptions = ['self', 'freelancer'];
    projectTypeOptions = [];
    fileTypeOptions = [];
    httpOptions: RequestOptions;
    environment: any;
    project: any = {
        projectName: '',
        projectStorage: '',
        annotateBy: '',
        projectType: '',
        fileType: ''
    };
    annotateBy: any;
    currentStatus: any;
    readonly STATUS_INITIAL = 0;
    readonly STATUS_SAVING = 1;
    readonly STATUS_SUCCESS = 2;
    readonly STATUS_FAILED = 3;

    constructor(private alertService: AlertService, private projectService: ProjectService, private titleService: Title,
        private notify: NotificationsService, private router: Router, private appService: AppService, private http: Http) {
    }

    ngOnInit() {
        this.titleService.setTitle('My Project | OCLAVI');
        this.searchTerm = '';
        this.sortingMethod = 'None';
        this.environment = environment;
        this.projectTypeOptions.push(environment.PROJECT_TYPE.image_segmentation);
        this.fileTypeOptions.push(environment.FILE_TYPE.file_image);
        this.httpOptions = new RequestOptions({ withCredentials: true });


        this.user = JSON.parse(localStorage.getItem('user'));

        // If user is pro user, enable the image tagging option
        if (this.user.USER_TYPE == environment.USER_TYPE.SELF.NAME || this.user.USER_TYPE == environment.USER_TYPE.ADMIN.NAME) {
            this.projectTypeOptions.push(environment.PROJECT_TYPE.image_tagging);
            this.fileTypeOptions.push(environment.FILE_TYPE.file_video);
        }

        // If semntic segmentation is available for current user, show the CHECKBOX in 'add project modal'
        if (this.user.USER_TYPE == environment.USER_TYPE.SELF.NAME || this.user.USER_TYPE == environment.USER_TYPE.ADMIN.NAME) {
            this.project.semantic_segmentation = false;
        }

        // Getting activated Storage types of user to show in dropdown menu while creating new project
        if (this.user && this.user.USER_TYPE != environment.USER_TYPE.TEAM.NAME) {
            for (let key in this.user.SUBSCRIPTION_FLAG.STORAGE) {

                console.log('the enabled list needs to come from the Backend instead of the hard coding');

                if (this.user.SUBSCRIPTION_FLAG.STORAGE[key] === true && (key == 'S3' || key == 'GOOGLE_DRIVE' || key == 'AZURE_STORAGE')) {
                    this.activatedStorageTypes.push(key);
                }
            }
            this.activatedStorageTypes.sort();
        }

        this.http.get(environment.oclaviServer + 'whats-new?version=' + environment.version, this.httpOptions).subscribe(res => {
            var data = res.json();

            if(data.length > 0) {
                this.whatsNewImage = data[0].imageUrl; //need to implement corrosal for more than 1 elements
                this.openModal('whats-new-modal');

                $('#whats-new-modal').on('hidden.bs.modal', () => {
                    var data = {
                        version: environment.version
                    }
                    this.http.post(environment.oclaviServer + 'whats-new-seen', data, this.httpOptions).subscribe(res => {
                        console.log('Image Marked as seen');
                    }, err => {
                        console.log('Error while marking the whats new image as seen')
                    });
                });
            }
        }, err => {
            console.log('Error while getting whats new image')
        });
    }

    openModal(id) {
        $('#' + id).modal('show');
    }

    // Show grid mode or list mode
    changeViewMode() {
        this.gridViewMode = !this.gridViewMode;
    }

    changeSortingMethod(method) {
        this.sortingMethod = method;
    }

    addProjectModal() {
        if (this.user.USER_TYPE != environment.USER_TYPE.TEAM.NAME) {
            $('#addProject').modal('show');
        }
    }

    // Changing route
    changeTab(tab, projectId) {
        this.projectService.currentProject = projectId;
        this.appService.currentTab.next(tab);
        // this.goToProjectSettings.emit(tab);
        this.router.navigate([`profile/projects/${projectId}`]);
    }

    // Set project name, storage and annotate_by fields
    setProperty(name, value) {
        this.project[name] = value;
    }

    createProject() {

        if (this.user.USER_TYPE != environment.USER_TYPE.TEAM.NAME) {
            $('#addProject').modal('hide');

            if (this.project.projectName == '' || this.project.projectStorage == '' || this.project.annotateBy == '' || this.project.projectType == '' || this.project.fileType == '' )
                this.alertService.show('error', 'All fields are required!');

            else {
                this.currentStatus = this.STATUS_SAVING;

                this.notify.info('Creating project, Please wait...');

                this.projectService.createProject(this.project)
                .subscribe(response => {
                    for (let key in response.user.PROJECTS) {
                        if (!this.user.PROJECTS[key]) {
                          this.user.PROJECTS = Object.assign({}, this.user.PROJECTS, {[key] : response.user.PROJECTS[key]});
                          break;
                        }
                      }

                      localStorage.setItem('user', JSON.stringify(this.user));

                      this.project = {projectName: '', projectStorage: '', annotateBy: '', projectType: '', fileType: ''};
                      this.notify.success(null, 'Project created successfully.');
                      this.currentStatus = this.STATUS_SUCCESS;
                    }, err => {
                        console.log(err);
                        this.notify.error(null, err);
                        this.currentStatus = this.STATUS_FAILED;
                    });
            }
        }
    }

}
