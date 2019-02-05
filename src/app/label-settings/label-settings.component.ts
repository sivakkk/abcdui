import { Component, OnInit, Input } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { AppService } from '../app-service.service';
import { environment } from '../../environments/environment';
import { NotificationsService } from 'angular2-notifications';
import { Title, Meta } from '@angular/platform-browser';
import { ProjectService } from '../project.service';
import { Router } from '@angular/router';

declare var ProductTour: any;
declare var setTimeout: any;

@Component({
    selector: 'app-label-settings',
    templateUrl: './label-settings.component.html',
    styleUrls: ['./label-settings.component.scss']
})
export class LabelSettingsComponent implements OnInit {

    // @Input() tab: string;
    @Input() user;
    labels: any;
    label: any;
    httpOptions: RequestOptions;
    projectId: any;
    session: any;
    segmentationLabels: Array<any>;

    constructor(private appService: AppService, private http: Http, private projectService: ProjectService,
        private notify: NotificationsService, meta: Meta, titleService: Title, private router: Router) {
        titleService.setTitle('Label Settings | OCLAVI');
        meta.addTags([
            { name: 'author', content: 'Carabiner Technologies Private Limited' }
        ]);
    }

    ngOnInit() {
        this.session = JSON.parse(localStorage.getItem('user'));

        // Team user can't access this page
        if (this.session.USER_TYPE == environment.USER_TYPE.TEAM.NAME) {
            this.router.navigate(['profile/my_project']);
        }
        this.projectId = this.projectService.currentProject;
        // if(!this.appService.getCookies('oclavi-label-tour')) {
        //     setTimeout( () => {
        //        this.initTour();
        //    }, 1000);
        // }
        // this.segmentationLabels = [{
        //     LABEL_NAME: 'People',
        //     LABEL_CATEGORY: 'People'
        // }, {
        //     LABEL_NAME: 'Car',
        //     LABEL_CATEGORY: 'Vehicle'
        // }];

        this.segmentationLabels = [];

        this.label = {
            LABEL_NAME: '',
            LABEL_CATEGORY: '',
            LABEL_COLOR: '#000000'
        };
        this.httpOptions = new RequestOptions({ withCredentials: true });

        // Getting labels for current project
        this.http.get(environment.oclaviServer + 'labels?projectId=' + this.projectId, this.httpOptions).subscribe(res => {
            this.labels = res.json();

            this.labels.map((item) => {
                item['edit'] = false;

                if (!item.LABEL_COLOR) {
                    item['LABEL_COLOR'] = '#FF0000';
                }

                this.segmentationLabels = [
                    ...this.segmentationLabels, {
                        LABEL_NAME: item.LABEL_NAME,
                        LABEL_CATEGORY: item.LABEL_CATEGORY
                    }];
            });
        }, err => {
            this.notify.error('Error while retreiving the labels.');

            this.appService.errorHandler(err);
        });
    }

    labelChanged(label) {
        this.label.LABEL_CATEGORY = label.LABEL_CATEGORY;
        this.label.LABEL_NAME = label.LABEL_NAME;
    }

    editLabel(index, _id) {
        this.labels[index].edit = true;
    }

    saveLabel(index, _id) {
        this.http.post(environment.oclaviServer + 'labels', { label: this.labels[index], projectId: this.projectId }, this.httpOptions)
            .subscribe(res => {
                this.labels[index].edit = false;
                // this.label.LABEL_NAME = null;

                this.notify.info('Label changes have been saved.');
            }, err => {
                this.appService.errorHandler(err);

                this.notify.error('Error while added new label.');
            });
    }

    deleteLabel(index, _id) {
        this.http.delete(environment.oclaviServer + 'labels/' + _id, this.httpOptions).subscribe(res => {
            this.labels.splice(index, 1);

            this.notify.success('Label has been deleted.');
        }, err => {
            this.appService.errorHandler(err);
            this.notify.error('Error while deleting the label.');
        });
    }

    addLabel() {
        if (this.validator()) {
            this.label.LABEL_NAME = this.label.LABEL_NAME.trim();
            this.label.LABEL_CATEGORY = this.label.LABEL_CATEGORY.trim();
            this.http.post(environment.oclaviServer + 'labels', { label: this.label, projectId: this.projectId }, this.httpOptions)
                .subscribe(res => {
                    this.notify.success('A new label has been added.');

                    this.labels.push({
                        LABEL_NAME: this.label.LABEL_NAME,
                        LABEL_CATEGORY: this.label.LABEL_CATEGORY,
                        LABEL_COLOR: this.label.LABEL_COLOR,
                        _id: res.json()._id
                    });

                    this.label = {
                        LABEL_NAME: '',
                        LABEL_CATEGORY: '',
                        LABEL_COLOR: '#000000'
                    };
                }, err => {
                    this.notify.error('Error while adding a new label.');

                    this.appService.errorHandler(err);
                });
        }
    }

    // To validate if the fields are not empty
    validator() {
        var validate = true;
        if (this.label.LABEL_NAME == '') {
            this.notify.error(null, 'Please enter label name');
            validate = false;
        }

        if (this.label.LABEL_CATEGORY == '') {
            this.notify.error(null, 'Please enter label category');
            validate = false;
        }

        for (let i = 0; i < this.labels.length; i++) {
            if (this.labels[i].LABEL_NAME === this.label.LABEL_NAME.trim() && this.labels[i].LABEL_CATEGORY === this.label.LABEL_CATEGORY.trim()) {
                this.notify.error(null, 'Label already exists!');
                validate = false;
                break;
            }
        }

        return validate;
    }

    // initTour() {
    //     var productTour = new ProductTour({
    //         overlay:true,
    //         onStart: function () {},
    //         onChanged:function (e) {},
    //         onClosed:(e)=> {
    //             this.appService.setCookies('oclavi-label-tour',1);
    //         }
    //      });

    //     productTour.steps([
    //         {
    //             element: '#pt-add-label',
    //             title: 'Add label',
    //             content: 'Add the label and categories details for which you need the classification',
    //             position: 'top'
    //         }
    //     ]);
    //     productTour.startTour();
    // }
}
