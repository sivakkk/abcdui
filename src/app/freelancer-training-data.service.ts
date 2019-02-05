import { Injectable } from '@angular/core';
import { Http, RequestOptions, Response } from '@angular/http';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class FreelancerTrainingDataService {
    options = new RequestOptions({ withCredentials: true });

    constructor(private http: Http) { }

    getFreelancerTrainingImgData(imageId): Observable<any> {
        return this.http.get(environment.oclaviServer + 'freelancer/getClassifiedData/' + imageId, this.options)
            .map((res: Response) => res.json());
    }


    formatAnnotationData(annotationData, image_width, image_height) {
        var widthFactor = image_width / 100;
        var heightFactor = image_height / 100;
        var LABEL_DETAILS = [];

        for (var key in annotationData) {
            var obj: any = {
                LABEL_NAME: key
            }

            if (annotationData[key].rect.length > 0) {
                obj.EDGES_RECT = new Array();

                annotationData[key].rect.forEach(function (item) {
                    if (item.height < 0) {
                        item.startY = item.startY + item.height;
                        item.height *= -1;
                    }

                    if (item.width < 0) {
                        item.startX = item.startX + item.width;
                        item.width *= -1;
                    }

                    obj.EDGES_RECT.push({
                        START_X: item.startX * widthFactor,
                        START_Y: item.startY * heightFactor,
                        HEIGHT: item.height * heightFactor,
                        WIDTH: item.width * widthFactor
                    });
                });
            }

            LABEL_DETAILS.push(obj);
        }

        return LABEL_DETAILS;
    }


    // Returns true if annotated data has error more than training error limit
    hasAnnotationError (referenceData, currentData, imageWidth, imageHeight) {
        const leeway = environment.training_error;

        for (let i = 0; i < referenceData.length; i++) {
            if (referenceData[i].LABEL_NAME === currentData[i].LABEL_NAME) {
                const shapesInRefData = referenceData[i].EDGES_RECT ? referenceData[i].EDGES_RECT.length : 0;
                const shapesInCurrentData = currentData[i].EDGES_RECT ? currentData[i].EDGES_RECT.length : 0;
                let countAccurateShapes = 0;

                if (shapesInRefData === 0 && shapesInCurrentData === 0) {
                    continue;
                }

                if (shapesInRefData === shapesInCurrentData) {

                    for (let j = 0; j < referenceData[i].EDGES_RECT.length; j++) {
                        const refRect = referenceData[i].EDGES_RECT[j];
                        const drawnRect = currentData[i].EDGES_RECT[j];

                        // Edge case where START_Y and START_X is 0
                        if (refRect.START_X === 0 && refRect.START_Y === 0 &&
                            (Math.abs(refRect.START_X - drawnRect.START_X) <= imageWidth / 10 ) &&
                            (Math.abs(refRect.START_Y - drawnRect.START_Y) <= imageHeight / 10 )) {

                            if (Math.abs((refRect.WIDTH - drawnRect.WIDTH) / refRect.WIDTH) < leeway
                            && Math.abs((refRect.HEIGHT - drawnRect.HEIGHT) / refRect.HEIGHT) < leeway) {
                                countAccurateShapes++;
                            }
                        }

                        // Edge case where START_X is 0
                        else if ((refRect.START_X === 0 && Math.abs(refRect.START_X - drawnRect.START_X) <= imageWidth / 10)) {
                            if (Math.abs((refRect.START_Y - drawnRect.START_Y) / refRect.START_Y) < leeway
                            && Math.abs((refRect.WIDTH - drawnRect.WIDTH) / refRect.WIDTH) < leeway
                            && Math.abs((refRect.HEIGHT - drawnRect.HEIGHT) / refRect.HEIGHT) < leeway) {
                                countAccurateShapes++;
                            }
                        }

                        // Edge case where START_Y is 0
                        else if ((refRect.START_Y === 0 && Math.abs(refRect.START_Y - drawnRect.START_Y) <= imageHeight / 10)) {
                            if (Math.abs((refRect.START_X - drawnRect.START_X) / refRect.START_X) < leeway
                            && Math.abs((refRect.WIDTH - drawnRect.WIDTH) / refRect.WIDTH) < leeway
                            && Math.abs((refRect.HEIGHT - drawnRect.HEIGHT) / refRect.HEIGHT) < leeway) {
                                countAccurateShapes++;
                            }
                        }

                        // Checks the START_X, START_Y, WIDTH and HEIGHT are within limits
                        else if (Math.abs((refRect.START_X - drawnRect.START_X) / refRect.START_X) < leeway
                        && Math.abs((refRect.START_Y - drawnRect.START_Y) / refRect.START_Y) < leeway
                        && Math.abs((refRect.WIDTH - drawnRect.WIDTH) / refRect.WIDTH) < leeway
                        && Math.abs((refRect.HEIGHT - drawnRect.HEIGHT) / refRect.HEIGHT) < leeway) {
                            countAccurateShapes++;
                        }
                    }
                    if (countAccurateShapes === shapesInRefData) {
                        continue;
                    } else {
                        const msg = 'Drawn shapes for ' + referenceData[i].LABEL_NAME + ' are not within limits. Please draw again!';
                        return ({hasError: true, msg: msg});
                    }
                }
                else if (shapesInRefData > shapesInCurrentData) {
                    const diff = shapesInRefData - shapesInCurrentData;
                    const msg = 'Please draw ' + diff + ' more ' + (diff === 1 ? 'shape' : 'shapes') + ' for ' + referenceData[i].LABEL_NAME;
                    return ({hasError: true, msg: msg});
                }
                else if (shapesInRefData < shapesInCurrentData) {
                    const diff = shapesInCurrentData - shapesInRefData;
                    const msg = 'You\'ve drawn ' + diff + ' extra ' + (diff === 1 ? 'shape' : 'shapes') + ' for ' + referenceData[i].LABEL_NAME;
                    return ({hasError: true, msg: msg});
                }
            }
        }

        return ({hasError: false, msg: 'No errors found.'});
    }


}
