
import { Component, OnInit, Input } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { AppService } from '../app-service.service';
import { LoaderService } from '../loader.service';
import { NotificationsService } from 'angular2-notifications';
import { Title } from '@angular/platform-browser';
import { ProjectService } from '../project.service';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

declare var $: any;

@Component({
    selector: 'app-read-instructions-settings',
    templateUrl: './read-instruction-settings.component.html',
    styleUrls: ['./read-instruction-settings.component.scss']
})
export class ReadInstructionSettingsComponent implements OnInit {

    user;
    projectId;
    allReadInstructions;
    currentVersion: number = 0;
    allVersions: number[] = [];
    editorContent;
    editorConfig = {
        editable: true,
        spellcheck: true,
        height: '10rem',
        minHeight: '5rem',
        placeholder: 'Enter text here...',
        translate: 'no',
        imageEndPoint:  environment.oclaviServer + 'upload/readMeImg',
        "toolbar": [
            ["bold", "italic", "underline", "strikeThrough", "superscript", "subscript"],
            ["fontName", "fontSize", "color"],
            ["justifyLeft", "justifyCenter", "justifyRight", "justifyFull", "indent", "outdent"],
            ["cut", "copy", "delete", "removeFormat", "undo", "redo"],
            ["paragraph", "blockquote", "removeBlockquote", "horizontalLine", "orderedList", "unorderedList"],
            ["link", "unlink", "image"]
        ]
    };

    constructor(private appService: AppService, private http: Http, private projectService: ProjectService,
        private notify: NotificationsService, private titleService: Title, private loadingService: LoaderService, 
        private router: Router) {

        this.projectId = this.projectService.currentProject;
    }

    ngOnInit() {
        this.user = JSON.parse(localStorage.getItem('user'));

        if (this.user.USER_TYPE == environment.USER_TYPE.TEAM.NAME) {
            this.router.navigate(['profile/my_project']);
        }

        this.titleService.setTitle('Instructions - OCLAVI');
        this.setNgxEditor(undefined);
    }

    setContentVersionArray(globalReadMes) {
        this.allVersions = [];

        globalReadMes.forEach(element => {
            this.allVersions.push(parseInt(element.VERSION));
        });
    }

    setMostRecentVersion(userSelectedVersion) {        

        if(userSelectedVersion != null && userSelectedVersion != undefined)
        {
            this.currentVersion = userSelectedVersion;
            return;
        }

        if (this.allVersions != null && this.allVersions != undefined && this.allVersions.length > 0) {
            this.currentVersion = Math.max.apply(null, this.allVersions);
        }       
    }

    setEditorContent(contentVersion) {        
        this.allReadInstructions.forEach(element => {
            if (element.VERSION == contentVersion) {
                this.editorContent = element.README_CONTENT;
            }
        });
    }

    setNgxEditor(versionSelected) {

        this.projectService.getReadInstructions(this.projectId)
            .subscribe(response => {
                this.allReadInstructions = response;
                this.setContentVersionArray(this.allReadInstructions);
                this.setMostRecentVersion(versionSelected);
                this.setEditorContent(this.currentVersion);                
            }, err => {
                this.notify.error(null, err);
            });
    }


    preview() {
        $('#readMeMsg').html(this.editorContent)
        $('#readInstructions').modal('show');
    }

    publish() {

        this.loadingService.show('Publishing read me details');

        var readMeData = {
            projectId: this.projectService.currentProject,
            editorData: this.editorContent,
            versionCount: this.allReadInstructions.length
        };

        this.projectService.saveReadInstructions(readMeData).subscribe(res => {
            this.loadingService.hide();
            this.notify.success('Successfully published read me details.');
            this.setNgxEditor(undefined);
        }, err => {
            this.loadingService.hide();
            this.notify.error(null, 'Server Error');
        });        
    }

    changeContentVersion(contentVersion) {                 
        this.setEditorContent(contentVersion);
        this.currentVersion = contentVersion;
    }

}