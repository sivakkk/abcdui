import { Injectable } from '@angular/core';
import { Http, RequestOptions, Response } from '@angular/http';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class ProjectService {
    currentProject;   // Stores current Project's Id
    imgCountsForCurrentProject = new Subject();
    options = new RequestOptions({ withCredentials: true });

    constructor(private http: Http) { }

    getProjects(): Observable<any> {
        return this.http.get(environment.oclaviServer + 'project/getProjects', this.options)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
    }

    createProject(project): Observable<any> {
        return this.http.post(environment.oclaviServer + 'project/createProject', project, this.options)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error')
            );
    }

    selectProjectFolder(folderId): Observable<any> {    // Sending folderId with projectId
        return this.http.post(environment.oclaviServer + 'project/selectProjectFolder', folderId, this.options)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
    }

    getReadInstructions(projectId): Observable<any> {
        return this.http.get(environment.oclaviServer + 'project/getProjectReadInstructions/' + projectId, this.options)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
    }

    saveReadInstructions(globalReadMeDetails): Observable<any> {
        return this.http.post(environment.oclaviServer + 'project/addProjectReadInstructions', globalReadMeDetails, this.options)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
    }

    getFreelancerProjectCost(projectIdAndShapeDetails): Observable<any> {
        return this.http.post(environment.oclaviServer + 'getBillingAmount', projectIdAndShapeDetails, this.options)
            .map((res: Response) => res.json());
    }

    sendAcceptProjectLinktoFreelancers(projectId): Observable<any> {  // Only for freelancer projects
        return this.http.post(environment.oclaviServer + 'project/sendAcceptProjectLink', { PROJECT_ID: projectId }, this.options)
            .map((res: Response) => res.json());
    }

    getClassifyImageLimit(totalImages) {  // Use when current project is ANNOTATE_BY freelancer
        let limit;

        environment.FREELANCER_PROJECT_IMG_LIMIT.some((obj, i, arr) => {
            if (totalImages >= obj.MIN_IMAGES && totalImages <= obj.MAX_IMAGES) {
                limit = obj.PERCENTAGE;
                return true;
            } else if (i === (arr.length - 1) && !limit) {
                limit = obj.PERCENTAGE;
            }
        });
        return limit;
    }

    getFreelancerProjects(): Observable<any> {
        return this.http.get(environment.oclaviServer + 'freelancer/getProjects', this.options)
            .map((res: Response) => res.json());
    }
}
