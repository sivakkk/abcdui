import { Component, OnInit, ElementRef, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { AlertService } from '../alert.service';
import { AppService } from '../app-service.service';
import { LoaderService } from '../loader.service';
import { NotificationsService } from 'angular2-notifications';
import { environment } from '../../environments/environment';
import { Circle } from './circle';
import { Rectangle } from './rectangle';
import { Polygon } from './polygon';
import { Point } from './point';
import { Cuboid } from './cuboid';
import { ProjectService } from '../project.service';
import { Title, Meta } from '@angular/platform-browser';
import { FreelancerTrainingDataService } from '../freelancer-training-data.service';
import { HttpHeaders } from '@angular/common/http';

declare var $: any;
declare var ProductTour: any;

@Component({
    selector: 'app-classify',
    templateUrl: './classify.component.html',
    host: { '(window:keydown)': 'hotkeys($event)' },
    styleUrls: ['./classify.component.scss']
})
export class ClassifyComponent implements OnInit, OnDestroy, AfterViewInit {
    readInstructionContent: string;
    closestCoordinate: number;
    closestEdge: number;

    mode: string;
    vm: any;
    image: any;
    user: {};
    canvasOffset: any;
    imageClassifiedCount: number;
    offsetX: number;
    offsetY: number;
    mouseX: number;
    mouseY: number;
    labels: any;

    resizeStart: boolean;
    resizePrevX: number;
    resizePrevY: number;

    canvas: any;
    canvasImage: any;
    canvasWidth: number;
    canvasHeight: number;
    ctx: any;
    ctx2: any;
    canvas2: any;

    currentLabel: string;
    currentCategory: string;
    currentColor: string;

    httpOptions: RequestOptions;
    socket: any;
    session: any;

    progress: number;
    totalClassified: number;
    totalImages: number;
    imageBaseEncoding: string;
    imageWidth = 640;
    imageHeight = 640;

    timerId: any;
    autoSaveTimer: any;
    inactivityTimer: any;
    seconds: number;
    minutes: number;
    hours: number;

    scale = 1;
    zoomStep = 0.1;
    zoomThreshold = 2;
    zoomMultiplier: number;
    zoomLevel = 0;

    isMove: boolean;
    movePrevX: number;
    movePrevY: number;
    totalMoveX: number;
    totalMoveY: number;
    moveTop: number;
    moveBottom: number;
    moveLeft: number;
    moveRight: number;
    moveLeftThreshold: number;
    moveRightThreshold: number;
    moveTopThreshold: number;
    moveBottomThreshold: number;
    moveStep = 20;

    lastShape: any;
    pointerSelectedIndex: number;
    pointerSelectedShape: string;
    tempCirlce: Circle;
    tempRectangle: Rectangle;
    tempPolygon: Polygon;
    tempCuboid: Cuboid;
    tempPoint: Point;
    shapes: Array<string>;

    projectId: string;
    showLayers: boolean;
    environment: any;
    initialCanvasWidth: number;
    initialCanvasHeight: number;

    semanticSegmentationRequired = false;
    segmentationLabelsList: Array<any>;
    segmentationDataExist: any;  // True, if current project's labels exist in segmentation label list
    segmentationData: any;
    referenceImageData: any; // For freelancer training
    alreadyClassified = false;

    objectDetails: any;
    imageFrames: Array<any>;
    currentFrameIndex: number;
    isVideoPlaying: Boolean;
    videoPlaySettimeoutId: any;
    videoSpeedOptions: Array<any>;
    currentVideoSpeed: any;
    metadata: any;

    controlToolProcessing: boolean;

    userAvatar = '../../assets/profile.png';

    constructor(private http: Http, private router: Router, private route: ActivatedRoute, private appService: AppService,
        private loadingService: LoaderService, private alertService: AlertService, private notify: NotificationsService,
        private projectService: ProjectService, meta: Meta, titleService: Title, private freelancerDataService: FreelancerTrainingDataService,
        private _location: Location) {

        this.socket = appService.getSocket();

        this.imageFrames = new Array();
        this.currentFrameIndex = -1;

        titleService.setTitle('Classify | OCLAVI');
        meta.addTags([
            { name: 'author', content: 'Carabiner Technologies Private Limited' }
        ]);

        var userData = localStorage.getItem('user');

        //used to store user information
        if (userData != null) {
            var parseData = JSON.parse(userData);
            this.session = {
                user: parseData
            }

            // if (parseData['USER_TYPE'] == environment.USER_TYPE.ADMIN.NAME || parseData['USER_TYPE'] == environment.USER_TYPE.STUDENT_ADMIN.NAME) {
            //     this.notify.error('Admin and Student Admin Account don\'t  have access to classify page');
            //     this.router.navigateByUrl('/');
            // }

            if (parseData['USER_AVATAR'] != undefined) {
                this.userAvatar = environment.oclaviServer + 'avatar/' + parseData['USER_AVATAR'];
                parseData['USER_AVA'] = this.userAvatar;
            }

            else
                parseData['USER_AVA'] = this.userAvatar;

        } else {
            this.router.navigateByUrl('/login');
        }

        this.user = {
            type: '',
            name: '',
            email: '',
        };
        this.router.routeReuseStrategy.shouldReuseRoute = function() {
            return false;
        };
    }

    ngOnInit() {
        this.loadingService.show('Loading...');
        this.projectId = this.projectService.currentProject;
        this.showLayers = false;
        this.environment = environment;
        this.isVideoPlaying = false;
        this.canvas = $('#canvas');
        this.canvas2 = $('#canvasImage');

        this.httpOptions = new RequestOptions({ withCredentials: true });

        this.getSchemaDetails();

        this.socket.on('multipleSession', (data) => {
            this.stopTimer();
            this.stopAutoSave();
            this.alertService.show('error', 'Multiple Session Detected.');
        });

        //initialise shape classes
        //Every shape has an object. Each of these shapes are defined in <shapename>.ts file eg: polygon.ts etc
        this.lastShape = new Array();
        this.tempCirlce = new Circle();
        this.tempRectangle = new Rectangle();
        this.tempPolygon = new Polygon();
        this.tempPoint = new Point();
        this.tempCuboid = new Cuboid();
        this.zoomMultiplier = this.scale + this.zoomStep;
        this.currentCategory = 'Category';
        this.controlToolProcessing = false;
        this.currentVideoSpeed = 1;
        this.videoSpeedOptions = [{
            label: '0.5x',
            value: 0.5
        }, {
            label: '0.75x',
            value: 0.75
        }, {
            label: '1x',
            value: 1
        }, {
            label: '1.25x',
            value: 1.25
        }, {
            label: '1.5x',
            value: 1.5
        }, {
            label: '1.75x',
            value: 1.75
        }, {
            label: '2x',
            value: 2
        }];

        // initilise empty array for shape based on user role
        this.shapes = new Array();
        this.totalMoveX = 0;
        this.totalMoveY = 0;

        const userType = JSON.parse(localStorage.getItem('user')).USER_TYPE;

        // Checking if Editing an already classified image functionality is available for current user
        if (userType == environment.USER_TYPE.SELF.NAME || userType == environment.USER_TYPE.STUDENT_SELF.NAME || userType == environment.USER_TYPE.TEAM.NAME) {
            this.route.params.subscribe(params => {
                if (params.type && params.type == 'edit') {
                    this.alreadyClassified = true;  // Setting flag to true, to fetch image progress from 'CLASSIFIED_OBJECT_COLLECTION'
                }
            }).unsubscribe();
        }

        this.socket.on('getImageFrame', (data) => {
            data.data = {};

            this.imageFrames.push(data);

            if (this.currentFrameIndex == -1) {
                this.currentFrameIndex++;

                this.imageFrames[this.currentFrameIndex].data = {};
                this.objectDetails.startTime = new Date();

                this.setCanvasWidthAndHeight();
                this.setImageToCanvas(data.base64Encoding);
                this.loadProgress();
            }
        });

        this.canvas.on('mousedown', this.mouseDownHandler.bind(this));
        this.canvas.on('mousemove', this.mouseMoveHandler.bind(this));
        this.canvas.on('mouseup', this.mouseUpEventHandler.bind(this));
        this.canvas.on('mouseout', this.mouseOutEventHandler.bind(this));
    }

    getMiliseconds(timeExpression) {
        var arr = timeExpression.split(':').map(item => parseFloat(item));
        var seconds = (arr[2] + (arr[1] * 60) + arr[0] * 3600);

        return seconds * 1000;
    }

    getSchemaDetails() {
        this.loadingService.show('Getting Account details...');

        this.http.get(environment.oclaviServer + 'schema', this.httpOptions).subscribe(res => {
            this.session.admin = res.json();

            // enable shape for user based on user role
            // Create a schema to know what shapes are allowed
            // and what are not.
            if (this.session.admin.SUBSCRIPTION_FLAG.SHAPES.RECTANGLE)
                this.shapes.push('rect');

            if (this.session.admin.SUBSCRIPTION_FLAG.SHAPES.POLYGON)
                this.shapes.push('poly');

            if (this.session.admin.SUBSCRIPTION_FLAG.SHAPES.CIRCLE)
                this.shapes.push('circle');

            if (this.session.admin.SUBSCRIPTION_FLAG.SHAPES.POINT)
                this.shapes.push('point');

            if (this.session.admin.SUBSCRIPTION_FLAG.SHAPES.CUBOID)
                this.shapes.push('cuboid');


            // this situation will arise when the person is refreshing the screen
            if (!this.projectId) {
                this.route.params.subscribe(params => {
                    this.http.get(environment.oclaviServer + 'project/getProjectIdFromImage/' + params['id'], this.httpOptions).subscribe(res => {
                        this.projectService.currentProject = res.json().projectId;
                        this.projectId = this.projectService.currentProject;

                        // Checking if semantic segmentation required
                        this.semanticSegmentationRequired = this.session.admin.PROJECTS[this.projectId].SEMANTIC_SEGMENTATION;
                        this.getLabelsForSegmentation();
                        this.setNgxEditor();
                        this.getLabels();
                        this.getClassifiedImageCount();
                    }, err => {
                        this.errorHandler(err, 'Error getting the projects...');
                    });
                }).unsubscribe();
            }

            else {
                this.semanticSegmentationRequired = this.session.admin.PROJECTS[this.projectId].SEMANTIC_SEGMENTATION;
                this.getLabelsForSegmentation();
                this.setNgxEditor();
                this.getLabels();
                this.getClassifiedImageCount();
            }
        }, err => {
            this.errorHandler(err, 'Error loading account details...');
        });
    }

    getLabels() {
        // Fetches Labels
        this.loadingService.show('Getting list of labels...');

        this.http.get(environment.oclaviServer + 'labels?projectId=' + this.projectId, this.httpOptions).subscribe(res => {
            this.labels = res.json();

            if (this.labels.length == 0)
                this.notify.error({}, 'No labels were found. Please add labels.');

            else {
                // Checking if any labels from current project matches with semantic segmentation labels
                if (this.semanticSegmentationRequired && (this.session.admin.USER_TYPE === environment.USER_TYPE.SELF.NAME || this.session.admin.USER_TYPE === environment.USER_TYPE.ADMIN.NAME) &&
                    this.segmentationLabelsList && this.segmentationLabelsList.length !== 0) {
                    this.segmentationDataExist = this.labels.some(label => {
                        if (this.segmentationLabelsList.indexOf(label.LABEL_NAME.toLowerCase()) > -1) {
                            return true;
                        }
                    });
                }
                this.resetBoundingBoxAndFetchNewImage();
            }
        }, err => {
            this.errorHandler(err, 'Error loading labels...');
        });
    }

    getClassifiedImageCount() {
        //Gets Classified Images and Total Images to initialise the progress bar
        this.http.get(environment.oclaviServer + 'imageClassifiedCount?projectId=' + this.projectId, this.httpOptions).subscribe(res => {
            var json = res.json();

            this.totalClassified = json.totalClassified;
            this.totalImages = json.totalImages;

            this.progress = this.totalClassified / this.totalImages * 100;
        }, err => {
            this.errorHandler(err, 'Error fetching classified image count.');
        });
    }

    getLabelsForSegmentation() {
        // From Amipod server for semantic segmentation
        if (this.semanticSegmentationRequired && this.session.admin.USER_TYPE === environment.USER_TYPE.SELF.NAME || this.session.admin.USER_TYPE === environment.USER_TYPE.ADMIN.NAME) {
            this.http.get(environment.amipodServer + 'annotation/segmentation_labels_list')
                .subscribe(response => {
                    this.segmentationLabelsList = response.json();  // Storing all available labels for semantic segmentation
                }, err => {
                    this.notify.error(null, 'Error occured while fetching segmentation labels');
                });
        }
    }

    mouseDownHandler(e) {
        //Everytime you press mouse button down, this function gets triggered
        e.preventDefault();
        e.stopPropagation();

        let mouseX = e.pageX - this.offsetX;
        let mouseY = e.pageY - this.offsetY;

        if (this.mode == 'cuboid' && this.session.admin.SUBSCRIPTION_FLAG.SHAPES.CUBOID) {
            this.resetSelectedShape();
            this.tempCuboid.isDown = true;
            this.tempCuboid.setStartPoint(mouseX, mouseY);
        }

        else if (this.mode == 'polygon' && this.session.admin.SUBSCRIPTION_FLAG.SHAPES.POLYGON) {
            this.resetSelectedShape();
            this.tempPolygon.drawStarted = true;
            this.tempPolygon.addCoordinate(mouseX, mouseY);
            this.tempPolygon.draw(this.ctx, this.scale, this.imageFrames[this.currentFrameIndex].data[this.currentLabel].poly.length, 'NORMAL', this.currentColor);
        }

        else if (this.mode == 'rectangle' && this.session.admin.SUBSCRIPTION_FLAG.SHAPES.RECTANGLE) {
            this.resetSelectedShape();
            this.tempRectangle.drawStarted = true;
            this.tempRectangle.setStartPoint(mouseX, mouseY);
        }

        else if (this.mode == 'circle' && this.session.admin.SUBSCRIPTION_FLAG.SHAPES.CIRCLE) {
            this.resetSelectedShape();
            this.tempCirlce.drawStarted = true;
            this.tempCirlce.setCentre(mouseX, mouseY);
            this.tempCirlce.setRadius(0);
        }

        else if (this.mode == 'point') {
            this.resetSelectedShape();
            this.tempPoint.drawStarted = true;
            this.tempPoint.setCentre(mouseX, mouseY);
            this.tempPoint.scaleCoordinates(this.zoomMultiplier, this.zoomLevel, this.totalMoveX, this.totalMoveY);
            this.imageFrames[this.currentFrameIndex].data[this.currentLabel].point.push(this.tempPoint);

            this.drawAll();

            this.lastShape.push('point');
            this.tempPoint = new Point();
        }

        else if (this.mode == 'move' && this.session.admin.SUBSCRIPTION_FLAG.FEATURES.MOVE) {
            this.isMove = true;
            this.movePrevX = mouseX;
            this.movePrevY = mouseY;
        }

        else if (this.mode == 'pointer' && this.session.admin.SUBSCRIPTION_FLAG.FEATURES.SELECT) {  //logic for resize feature
            this.selectShape(mouseX, mouseY);

            if (this.pointerSelectedShape == 'cuboid') {
                this.tempCuboid = this.imageFrames[this.currentFrameIndex].data[this.currentLabel][this.pointerSelectedShape][this.pointerSelectedIndex];
                this.closestEdge = this.tempCuboid.findClosestCoordinate(this.scale, mouseX, mouseY);     //gets the closest edge and sets it as this.closestEdge
            }

            else if (this.pointerSelectedShape == 'rect') {
                this.tempRectangle = this.imageFrames[this.currentFrameIndex].data[this.currentLabel][this.pointerSelectedShape][this.pointerSelectedIndex];
                this.closestCoordinate = this.tempRectangle.findClosestCoordinate(this.scale, mouseX, mouseY);    //gets closest coordinate incase of a Rectangle
            }

            else if (this.pointerSelectedShape == 'poly') {
                this.tempPolygon = this.imageFrames[this.currentFrameIndex].data[this.currentLabel][this.pointerSelectedShape][this.pointerSelectedIndex];
                this.closestCoordinate = this.tempPolygon.findClosestCoordinate(this.scale, mouseX, mouseY);    //gets closest coordinate incase of a polygon
            }

            else
                this.drawAll();
        }

        else if (this.mode == 'point') {
            this.tempPoint.drawStarted = true;
            this.tempPoint.setCentre(mouseX, mouseY);
            this.tempPoint.scaleCoordinates(this.zoomMultiplier, this.zoomLevel, this.totalMoveX, this.totalMoveY);
            this.imageFrames[this.currentFrameIndex].data[this.currentLabel].point.push(this.tempPoint);

            this.drawAll();

            this.lastShape.push('point');
            this.tempPoint = new Point();
        }

        else
            this.notify.error('No mode has been selected');
    }

    mouseMoveHandler(e) {
        let mouseX = e.pageX - this.offsetX;
        let mouseY = e.pageY - this.offsetY;

        if (this.tempRectangle.drawStarted || this.tempPolygon.drawStarted || this.tempCirlce.drawStarted || this.isMove || this.tempCuboid.drawStarted1 || this.resizeStart) {

            e.preventDefault();
            e.stopPropagation();

            if (this.tempRectangle.drawStarted && this.mode == 'rectangle') {
                this.drawAll();

                this.tempRectangle.setWidthHeight(mouseX - this.tempRectangle.getStartX(), mouseY - this.tempRectangle.getStartY());
                this.tempRectangle.fill(this.ctx, this.currentColor);
            }

            else if (this.tempPolygon.drawStarted && this.mode == 'polygon') {
                this.drawAll();
                this.tempPolygon.setTempCoordinate(mouseX, mouseY);
                this.tempPolygon.draw(this.ctx, this.scale, this.imageFrames[this.currentFrameIndex].data[this.currentLabel].poly.length, 'NORMAL', this.currentColor);
                this.tempPolygon.fill(this.ctx, this.currentColor);
            }

            else if (this.isMove) {
                this.moveImage(mouseX - this.movePrevX, mouseY - this.movePrevY);

                this.movePrevX = mouseX;
                this.movePrevY = mouseY;
            }

            else if (this.mode == 'pointer' && this.resizeStart) {
                if (this.pointerSelectedShape == 'cuboid') {
                    this.tempCuboid.resizeShape(this.zoomMultiplier, this.zoomLevel, mouseX, mouseY, this.resizePrevX, this.resizePrevY, this.closestEdge);
                    this.imageFrames[this.currentFrameIndex].data[this.currentLabel][this.pointerSelectedShape][this.pointerSelectedIndex] = this.tempCuboid;
                } else if (this.pointerSelectedShape == 'poly') {
                    this.tempPolygon.resizeShape(this.zoomMultiplier, this.zoomLevel, mouseX, mouseY, this.resizePrevX, this.resizePrevY, this.closestCoordinate);
                    this.imageFrames[this.currentFrameIndex].data[this.currentLabel][this.pointerSelectedShape][this.pointerSelectedIndex] = this.tempPolygon;
                }
                else if (this.pointerSelectedShape == 'rect') {
                    this.tempRectangle.resizeShape(this.zoomMultiplier, this.zoomLevel, mouseX, mouseY, this.resizePrevX, this.resizePrevY, this.closestCoordinate);
                    this.imageFrames[this.currentFrameIndex].data[this.currentLabel][this.pointerSelectedShape][this.pointerSelectedIndex] = this.tempRectangle;
                }

                this.drawAll();

                this.resizePrevX = mouseX;
                this.resizePrevY = mouseY;
            }

            else if (this.tempCirlce.drawStarted) {
                this.drawAll();
                this.tempCirlce.setCircumferencePoint(mouseX, mouseY);
                this.tempCirlce.fill(this.ctx, this.currentColor);
            }

            else if (this.mode == 'cuboid') {
                if (!this.tempCuboid.drawStarted2 && this.tempCuboid.isDown) {
                    //cuboid is made of two rectangles joined by the vertices
                    this.drawAll();
                    this.tempCuboid.setWidthHeight(mouseX - this.tempCuboid.getStart1().x, mouseY - this.tempCuboid.getStart1().y);
                    //sets the width and height for first rectangle
                    this.tempCuboid.fill(this.ctx, this.currentColor);
                } else if (this.tempCuboid.isDown) {
                    this.drawAll();
                    this.tempCuboid.setWidthHeight(mouseX - this.tempCuboid.getStart2().x, mouseY - this.tempCuboid.getStart2().y);
                    //sets the width and height for second rectangle
                    this.tempCuboid.fill(this.ctx, this.currentColor);
                    this.tempCuboid.draw(this.ctx, this.scale, this.imageFrames[this.currentFrameIndex].data[this.currentLabel].cuboid.length, 'NORMAL', this.currentColor)
                }
            }
        }

        else if (this.pointerSelectedShape) {
            const selectedShape = this.imageFrames[this.currentFrameIndex].data[this.currentLabel][this.pointerSelectedShape][this.pointerSelectedIndex];

            if (selectedShape.isInside(this.scale, mouseX, mouseY))
                this.closestCoordinate = selectedShape.findClosestCoordinate(this.scale, mouseX, mouseY);    //gets closest coordinate incase of a Rectangle

            else
                $('app-classify').css('cursor', 'default');
        }
    }

    mouseUpEventHandler(e) {
        e.preventDefault();
        e.stopPropagation();

        if (this.mode == 'rectangle' && this.tempRectangle.drawStarted) {
            // if you are at higher zoom level and you drew a rectangle,
            // it's coordinates need to be first scaled down
            // because the current values of mouseX and mouseY are at higher zoom level
            this.tempRectangle.scaleCoordinates(this.zoomMultiplier, this.zoomLevel, this.totalMoveX, this.totalMoveY);

            this.imageFrames[this.currentFrameIndex].data[this.currentLabel].rect.push(this.tempRectangle);
            this.tempRectangle = new Rectangle();

            this.lastShape.push('rect');
            this.drawAll();
        }

        else if (this.mode == 'move' && this.isMove) {
            this.isMove = false;
        }

        else if (this.mode == 'pointer') {
            //frees the temp object so that it can be used for further operations
            this.resetResizeVariables();

            if (this.pointerSelectedShape == 'cuboid')
                this.tempCuboid = new Cuboid();
            else if (this.pointerSelectedShape == 'poly')
                this.tempPolygon = new Polygon();
            else if (this.pointerSelectedShape == 'rect')
                this.tempRectangle = new Rectangle();
        }

        else if (this.mode === 'circle' && this.tempCirlce.drawStarted) {
            this.tempCirlce.scaleCoordinates(this.zoomMultiplier, this.zoomLevel, this.totalMoveX, this.totalMoveY);

            this.drawAll();
            this.lastShape.push('circle');
            this.tempCirlce.draw(this.ctx, this.scale, this.imageFrames[this.currentFrameIndex].data[this.currentLabel].circle.length, 'NORMAL', this.currentColor);
            this.imageFrames[this.currentFrameIndex].data[this.currentLabel].circle.push(this.tempCirlce);
            this.tempCirlce = new Circle();
        }

        else if (this.mode === 'point' && this.tempCirlce.drawStarted) {
            this.tempCirlce.scaleCoordinates(this.zoomMultiplier, this.zoomLevel, this.totalMoveX, this.totalMoveY);
        }
        else if (this.mode === 'cuboid') {
            if (!this.tempCuboid.drawStarted2) {
                this.tempCuboid.isDown = false
                this.tempCuboid.drawRect(this.ctx, this.currentColor);
            } else {
                this.tempCuboid.isDown = false;
                this.tempCuboid.drawRect(this.ctx, this.currentColor);
                this.tempCuboid.draw(this.ctx, this.scale, this.imageFrames[this.currentFrameIndex].data[this.currentLabel].cuboid.length, 'NORMAL', this.currentColor);
                this.imageFrames[this.currentFrameIndex].data[this.currentLabel].cuboid.push(this.tempCuboid);
                this.tempCuboid = new Cuboid();
                this.lastShape.push('cuboid')
            }
        }

    }

    resetResizeVariables() {
        this.resizeStart = false;
        this.resizePrevX = 0;
        this.resizePrevY = 0;
    }

    mouseOutEventHandler(e) {
        e.preventDefault();
        e.stopPropagation();

        if (this.mode === 'polygon' && this.tempPolygon.drawStarted) {

            if (this.scale == 1) {
                this.imageFrames[this.currentFrameIndex].data[this.currentLabel].poly.push(this.tempPolygon);
                this.tempPolygon = new Polygon();
            }

            else {
                this.tempPolygon.scaleCoordinates(this.zoomMultiplier, this.zoomLevel, this.totalMoveX, this.totalMoveY);
                //a polygon is finished when the user moves out of the canvas area. This function does that
                this.imageFrames[this.currentFrameIndex].data[this.currentLabel].poly.push(this.tempPolygon);

                this.tempPolygon = new Polygon();
            }

            this.lastShape.push('poly');

            this.drawAll();

        }

        else if (this.isMove) {
            this.resizeStart = false;
            this.isMove = false;
        }
    }

    zoomPlus() {
        this.controlToolProcessing = true;

        //zooms in the image increasing the size of image by 10% of the original image everytime it is called
        if (this.scale >= this.zoomThreshold || !this.session.admin.SUBSCRIPTION_FLAG.FEATURES.ZOOM)
            return;

        this.scale = this.getFloatValue(this.scale + this.zoomStep, 1);
        this.zoomLevel++;

        if (this.session.admin.PROJECTS[this.projectId].PROJECT_TYPE == environment.PROJECT_TYPE.image_segmentation) {
            this.shapes.forEach((shape) => {
                this.imageFrames[this.currentFrameIndex].data[this.currentLabel][shape].forEach(variable => variable.zoom('plus', this.zoomMultiplier, this.totalMoveX, this.totalMoveY));
            });
        }

        this.zoomImage();

        this.controlToolProcessing = false;
    }

    zoomMinus() {
        this.controlToolProcessing = true;

        // decreases the image size
        // length of size 1 unit will be changed to (1 / 1.1) after every subsequent decrease of zoom levels
        if (this.scale <= 1 || !this.session.admin.SUBSCRIPTION_FLAG.FEATURES.ZOOM)
            return;

        this.scale = this.getFloatValue(this.scale - this.zoomStep, 1);
        this.zoomLevel--;

        if (this.session.admin.PROJECTS[this.projectId].PROJECT_TYPE == environment.PROJECT_TYPE.image_segmentation) {
            this.shapes.forEach((shape) => {
                this.imageFrames[this.currentFrameIndex].data[this.currentLabel][shape].forEach(variable => variable.zoom('minus', this.zoomMultiplier, this.totalMoveX, this.totalMoveY));
            });
        }

        this.zoomImage();

        this.controlToolProcessing = false;
    }

    getFloatValue(exp, precision = 3) {
        return parseFloat(exp.toFixed(precision));
    }

    zoomImage() {
        this.canvasImage.src = this.imageBaseEncoding;

        let temp = Math.pow(this.zoomMultiplier, this.zoomLevel);
        let vm = this;

        this.moveLeft = 0;
        this.moveRight = 0;
        this.moveTop = 0;
        this.moveBottom = 0;

        this.moveLeftThreshold = 0;
        this.moveTopThreshold = 0;
        this.moveRightThreshold = this.getFloatValue(this.canvasWidth / temp * (temp - 1));
        this.moveBottomThreshold = this.getFloatValue(this.canvasHeight / temp * (temp - 1));

        this.ctx2.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx2.scale(temp, temp);

        this.canvasImage.onload = function(evt) {
            vm.ctx2.drawImage(this, 0, 0, vm.canvasWidth, vm.canvasHeight);

            vm.drawAll();
        }

        this.totalMoveX = 0;
        this.totalMoveY = 0;
    }

    moveImage(x = 0, y = 0) {
        this.controlToolProcessing = true;

        //handles the movement of zoomed in images
        var flagX = false, flagY = false;

        if (x < 0) {
            if (this.moveRight < this.moveRightThreshold) {
                if (this.moveRight - x > this.moveRightThreshold)
                    x = this.moveRight - this.moveRightThreshold;

                this.moveRight += (-x);
                this.moveLeft += x;

                flagX = true;
            }

            else
                x = 0;
        }

        else if (x > 0) {
            if (this.moveLeft < this.moveLeftThreshold) {
                if (this.moveLeft + x > this.moveLeftThreshold)
                    x = this.moveLeftThreshold - this.moveLeft;

                this.moveLeft += x;
                this.moveRight += (-x);

                flagX = true;
            }

            else
                x = 0;
        }

        if (y < 0) {
            if (this.moveBottom < this.moveBottomThreshold) {
                if (this.moveBottom + (-y) > this.moveBottomThreshold)
                    y = this.moveBottom - this.moveBottomThreshold;

                this.moveBottom += (-y);
                this.moveTop += y;

                flagY = true;
            }

            else
                y = 0;
        }

        else if (y > 0) {
            if (this.moveTop < this.moveTopThreshold) {
                if (this.moveTop + y > this.moveTopThreshold)
                    y = this.moveTopThreshold - this.moveTop;

                this.moveTop += y;
                this.moveBottom += (-y);

                flagY = true;
            }

            else
                y = 0;
        }

        if (flagX || flagY) {
            this.canvasImage.src = this.imageBaseEncoding;

            let temp = Math.pow(this.zoomMultiplier, this.zoomLevel);
            this.totalMoveX += (temp * x);
            this.totalMoveY += (temp * y);

            if (this.session.admin.PROJECTS[this.projectId].PROJECT_TYPE == environment.PROJECT_TYPE.image_segmentation) {
                this.shapes.forEach(shape => {
                    this.imageFrames[this.currentFrameIndex].data[this.currentLabel][shape].forEach((variable) => variable.moveCoordinates(temp, x, y));
                });
            }

            let vm = this;

            this.canvasImage.onload = function(evt) {
                vm.ctx2.translate(x, y);
                vm.ctx2.drawImage(this, 0, 0, vm.canvasWidth, vm.canvasHeight);
            }

            this.drawAll();
        }

        this.controlToolProcessing = false;
    }

    selectShape(mouseX, mouseY) {
        // //used in the pointer mode, this function selects the shape and redraws it in a different colour to highlight
        this.resetSelectedShape();
        let flag = true;

        this.shapes.forEach(shape => {
            flag && this.imageFrames[this.currentFrameIndex].data[this.currentLabel][shape].every((variable, index) => {
                if (variable.isInside(this.scale, mouseX, mouseY)) {
                    this.pointerSelectedIndex = index;
                    this.pointerSelectedShape = shape;
                    this.resizeStart = true;
                    flag = false;

                    this.drawAll();
                }

                return flag;
            });
        });

        if (flag)
            $('app-classify').css('cursor', 'default');
    }

    resetSelectedShape() {
        this.pointerSelectedIndex = null;
        this.pointerSelectedShape = null;
    }

    selectShapeFromLayers(labelName, shapeName, index) {
        // If current shape is already selected, unselect it
        if (this.currentLabel === labelName && this.pointerSelectedShape === shapeName && this.pointerSelectedIndex === index) {
            this.drawAll();
            this.resetSelectedShape();
            return;
        }

        // Selecting the shape
        this.imageFrames[this.currentFrameIndex].data[labelName][shapeName].forEach((variable, i) => {
            if (index === i) {
                for (let i = 0; i < this.labels.length; i++) {
                    if (labelName === this.labels[i].LABEL_NAME) {
                        this.currentLabel = labelName;
                        this.currentCategory = this.labels[i].LABEL_CATEGORY;
                        this.currentColor = this.labels[i].LABEL_COLOR;
                        break;
                    }
                }

                this.mode = 'pointer';
                this.pointerSelectedIndex = i;
                this.pointerSelectedShape = shapeName;
                this.drawAll();
            }
        });
    }

    labelChanged(label) {
        this.currentCategory = label.LABEL_CATEGORY;
        this.currentColor = label.LABEL_COLOR;
        this.lastShape = new Array();
        this.mode = 'rectangle';

        this.totalMoveX = 0;
        this.totalMoveY = 0;

        this.drawAll();
    }

    removeObject() {
        //manages delete of a selected shape. if no shape is selected, nothing happens
        if (this.mode == 'pointer') {
            if (this.pointerSelectedIndex != null) {
                this.imageFrames[this.currentFrameIndex].data[this.currentLabel][this.pointerSelectedShape].splice(this.pointerSelectedIndex, 1);

                this.resetSelectedShape();

                this.drawAll();
            }
        }
    }

    ngOnDestroy() {
        this.stopTimer();
        this.stopAutoSave();
        // this.stopInactivityTimer();
    }

    startTimer(seconds, minutes, hours) {
        this.stopTimer();

        if (this.timerId == null) {
            this.seconds = seconds ? seconds : 0;
            this.minutes = minutes ? minutes : 0;
            this.hours = hours ? hours : 0;

            this.timerId = setInterval(() => {
                this.seconds++;

                if (this.seconds >= 60) {
                    this.seconds = 0;
                    this.minutes++;

                    if (this.minutes >= 60) {
                        this.minutes = 0;
                        this.hours++;
                    }
                }

                this.objectDetails.timeSpentByUser = (this.hours ? (this.hours > 9 ? this.hours : '0' + this.hours) : '00')
                    + ':' + (this.minutes ? (this.minutes > 9 ? this.minutes : '0' + this.minutes) : '00')
                    + ':' + (this.seconds > 9 ? this.seconds : '0' + this.seconds);
            }, 1000);
        }
    }

    startInactivityTimer() {
        this.stopInactivityTimer();

        if (this.inactivityTimer == null) {
            this.startTimer(this.seconds, this.minutes, this.hours);
            this.startAutoSave();

            this.inactivityTimer = setTimeout(() => {
                this.stopTimer();
                this.stopAutoSave();

                this.inactivityTimer = null;
            }, environment.inactivityTime);
        }
    }

    stopInactivityTimer() {
        if (this.inactivityTimer) {
            clearInterval(this.inactivityTimer);

            this.startTimer(this.seconds, this.minutes, this.hours);
            this.startAutoSave();

            this.inactivityTimer = null;
        }
    }

    changeMode(mode) {
        //called everytime a mode is pressed.unbinds and rebinds the event handlers to avoid duplication
        this.mode = mode;
        $('app-classify').css('cursor', 'default');
    }

    undo() {
        //removes the last shape drawn
        var lastShape = this.lastShape.pop();

        if (lastShape && this.imageFrames[this.currentFrameIndex].data[this.currentLabel][lastShape] && this.imageFrames[this.currentFrameIndex].data[this.currentLabel][lastShape].length > 0) {
            this.imageFrames[this.currentFrameIndex].data[this.currentLabel][lastShape].pop();

            this.drawAll();
        }
    }

    resetImage() {
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

        this.canvasImage.src = this.imageBaseEncoding;

        this.imageWidth = this.getFloatValue(this.imageWidth * Math.pow(this.zoomMultiplier, -this.zoomLevel));
        this.imageHeight = this.getFloatValue(this.imageHeight * Math.pow(this.zoomMultiplier, -this.zoomLevel));

        let vm = this;
        this.ctx2.clearRect(0, 0, this.canvasWidth, this.canvasHeight);   // Removing Image from Canvas
        this.ctx2.setTransform(1, 0, 0, 1, 0, 0);

        this.canvasImage.onload = function(evt) {
            // vm.ctx2.drawImage(this, 0, 0, vm.imageWidth, vm.imageHeight, 0, 0, vm.canvasWidth, vm.canvasHeight);
            vm.ctx2.drawImage(this, 0, 0, vm.canvasWidth, vm.canvasHeight);
        }

        this.scale = 1;
        this.drawAll();
    }

    stopTimer() {
        if (this.timerId) {
            clearInterval(this.timerId);

            this.timerId = null;
        }
    }

    drawAll() {
        console.log('this.imageFrames[this.currentFrameIndex]', this.imageFrames[this.currentFrameIndex]);

        //draws every shape in the queue. Not to be called directly from outside, internal function
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

        console.log(this.imageFrames[this.currentFrameIndex].data[this.currentLabel]['rect']);

        this.shapes.forEach(shape => {
            console.log('this.imageFrames[this.currentFrameIndex]', this.imageFrames[this.currentFrameIndex]);
            console.log('this.currentLabel', this.currentLabel);
            console.log('this.imageFrames[this.currentFrameIndex].data', this.imageFrames[this.currentFrameIndex].data);

            this.imageFrames[this.currentFrameIndex].data[this.currentLabel][shape].forEach((variable, index) => {
                if ((this.pointerSelectedIndex == index) && (this.pointerSelectedShape == shape))
                    variable.draw(this.ctx, this.scale, index, 'SELECT', environment.CANVAS_SHAPE['SELECT'].STROKE_COLOR)

                else
                    variable.draw(this.ctx, this.scale, index, 'NORMAL', this.currentColor);
            });
        });

        this.startInactivityTimer();
    }

    saveImage() {
        //saves image to the data, stringifying the image data and storing it to mongodb
        this.stopTimer();
        this.stopAutoSave();

        if (this.isAreaSelected()) {

            this.stopTimer();
            this.objectDetails.endTime = new Date();
            let url = 'saveImage';

            var data: any = {
                startTime: this.objectDetails.startTime,
                endTime: this.objectDetails.endTime,
                seconds: this.seconds,
                minutes: this.minutes,
                hours: this.hours,
                IMAGE_WIDTH: this.imageFrames[this.currentFrameIndex].IMAGE_WIDTH,
                IMAGE_HEIGHT: this.imageFrames[this.currentFrameIndex].IMAGE_HEIGHT,
                OBJECT_OID: this.imageFrames[this.currentFrameIndex].OBJECT_OID,
                USER_OID: this.imageFrames[this.currentFrameIndex].USER_OID,
                PROJECT_ID: this.projectId,
                data: {},
                projectType: this.session.admin.PROJECTS[this.projectId].PROJECT_TYPE
            };

            // If project has field ANNOTATE_BY = freelancer, send this data.ANNOTATE_BY field so image will be stored in FREELANCER_VALIDATION collection
            if (this.session.user.USER_TYPE !== environment.USER_TYPE.TEAM.NAME && this.session.user.USER_TYPE !== environment.USER_TYPE.FREELANCER.NAME && this.session.admin.PROJECTS[this.projectId].ANNOTATE_BY === environment.USER_TYPE.FREELANCER.NAME) {
                data.ANNOTATE_BY = this.session.admin.PROJECTS[this.projectId].ANNOTATE_BY;
            }

            console.log('this.image', this.image);
            this.downScaleCoordinates(this.image, data);

            // If user is freelancer and currently they are working on project training
            if (this.session.user.USER_TYPE === environment.USER_TYPE.FREELANCER.NAME && this.session.user.PROJECT_STATUS === 'TRAINING') {
                url = 'saveFreelancerTrainingImage';
                // Converting the data drawn by freelancer into Classified data
                const formatedData = this.freelancerDataService.formatAnnotationData(data.data, this.imageFrames[this.currentFrameIndex].IMAGE_WIDTH, this.imageFrames[this.currentFrameIndex].IMAGE_HEIGHT);
                // Comparing the shapes drawn by freelancer with shapes drawn by Project owner
                const annotationError = this.freelancerDataService.hasAnnotationError(this.referenceImageData, formatedData, this.imageFrames[this.currentFrameIndex].IMAGE_WIDTH, this.imageFrames[this.currentFrameIndex].IMAGE_HEIGHT);
                console.log('hasError', annotationError.hasError);

                if (!annotationError.hasError) {    // If no error found, continue and fetch next image
                    this.notify.success('No error found!');
                } else {
                    this.notify.error(annotationError.msg);
                    return;
                }
            }

            if (this.alreadyClassified) { // If image is already classified, changing endpoint for saving the image
                url = 'updateClassifiedImage';
            }

            this.loadingService.show('Saving your classification...');

            this.showLayers = false;

            this.http.post(environment.oclaviServer + url, JSON.stringify(data), this.httpOptions).subscribe(res => {
                this.notify.success('Your classification has been saved...');

                if (this.alreadyClassified) { // If classified image updated
                    this._location.back();
                } else {    // Regular flow
                    this.totalClassified++;

                    this.imageClassifiedCount++;
                    this.progress = this.totalClassified / this.totalImages * 100;    // For updating Progress bar

                    // Checking if project has to annotated by freelancer and project owner has classified necessary amount of images for training
                    if (this.session.user.USER_TYPE !== environment.USER_TYPE.TEAM.NAME && this.session.user.USER_TYPE !== environment.USER_TYPE.FREELANCER.NAME && this.session.admin.PROJECTS[this.projectId].ANNOTATE_BY === 'freelancer' && Math.ceil(this.progress) >= this.projectService.getClassifyImageLimit(this.totalImages)) {
                        this.loadingService.hide();
                        this.notify.error('Further images have to be classified by freelancer');
                        this.router.navigateByUrl('/profile');
                        return;
                    }

                    $('.canvas-container').css('max-height', this.initialCanvasHeight);
                    $('.canvas-container').css('max-width', this.initialCanvasWidth);

                    this.router.navigate([res.json().redirect]);
                }
            }, err => {
                this.errorHandler(err, 'Error saving your classification...');
            });
        } else {
            if (this.session.admin.PROJECTS[this.projectId].PROJECT_TYPE == environment.PROJECT_TYPE.image_segmentation) {
                this.notify.error('Please select an area...');
            }
            else {
                this.notify.error('Please select a label...');
            }
        }

    }

    isAreaSelected() {
        if (this.session.admin.PROJECTS[this.projectId].PROJECT_TYPE == environment.PROJECT_TYPE.image_segmentation) {
            //checks if any area is selected or not
            for (var key in this.imageFrames[this.currentFrameIndex].data)
                for (var shape in this.imageFrames[this.currentFrameIndex].data[key])
                    if (this.imageFrames[this.currentFrameIndex].data[key][shape].length && this.imageFrames[this.currentFrameIndex].data[key][shape].length > 0)
                        return true;

            return false;
        }
        else if (this.session.admin.PROJECTS[this.projectId].PROJECT_TYPE == environment.PROJECT_TYPE.image_tagging) {
            for (var key in this.imageFrames[this.currentFrameIndex].data) {
                if (this.imageFrames[this.currentFrameIndex].data[key] == true) {
                    return true;
                }
            }
            return false;
        }
    }

    clearArea() {
        //clears canvas for if the users wants to start afresh
        if (this.session.admin.SUBSCRIPTION_FLAG.SHAPES.RECTANGLE)
            this.imageFrames[this.currentFrameIndex].data[this.currentLabel].rect = new Array<Rectangle>();

        if (this.session.admin.SUBSCRIPTION_FLAG.SHAPES.POLYGON)
            this.imageFrames[this.currentFrameIndex].data[this.currentLabel].poly = new Array<Polygon>();

        if (this.session.admin.SUBSCRIPTION_FLAG.SHAPES.CIRCLE)
            this.imageFrames[this.currentFrameIndex].data[this.currentLabel].circle = new Array<Circle>();

        if (this.session.admin.SUBSCRIPTION_FLAG.SHAPES.CUBOID)
            this.imageFrames[this.currentFrameIndex].data[this.currentLabel].cuboid = new Array<Cuboid>();

        if (this.session.admin.SUBSCRIPTION_FLAG.SHAPES.POINT)
            this.imageFrames[this.currentFrameIndex].data[this.currentLabel].point = new Array<Point>();

        this.resetSelectedShape();

        this.drawAll();
        $('app-classify').css('cursor', 'default');
    }

    showInstruction() {
        $('#readMeMsg').html(this.readInstructionContent)
        $('#readInstructions').modal('show');
    }

    setNgxEditor() {

        this.projectService.getReadInstructions(this.projectId)
            .subscribe(response => {

                var readMeVersions = [];
                var mostRecentVersion = 0;

                // Convert versions to array
                response.forEach(element => {
                    readMeVersions.push(parseInt(element.VERSION));
                });

                // Gets most recent version
                if (readMeVersions != null
                    && readMeVersions != undefined
                    && readMeVersions.length > 0) {
                    mostRecentVersion = Math.max.apply(null, readMeVersions);
                }

                // Gets content of most recent version & sets it to modal popup body
                response.forEach(element => {
                    if (element.VERSION == mostRecentVersion) {
                        this.readInstructionContent = element.README_CONTENT;
                    }
                });

            }, err => {
                this.errorHandler.bind(this, err, 'Error getting the Read Instructions.');
            });
    }

    loadSementicSegmentations(data) {
        // Getting the segmentation data for current Image from AMIPOD server
        if ((this.session.admin.USER_TYPE === environment.USER_TYPE.SELF.NAME || this.session.admin.USER_TYPE === environment.USER_TYPE.ADMIN.NAME) && this.segmentationDataExist) {
            const formData = { base64: data.split(',')[1] };

            this.http.post(environment.amipodServer + 'annotation/segmentation/base64', formData)
                .subscribe(response => {
                    this.segmentationData = response.json();
                    this.drawSegmentation(data); // Draw segmentation data

                    let msg = 'Segmentaion data received';

                    if (this.segmentationData.length === 0) {
                        msg = 'No Segmentaion data found for this image';
                    }
                    this.notify.info(msg);
                }, err => {
                    this.notify.error(null, 'Error occured while fetching segmentation data');
                });
        }
    }

    setCanvasWidthAndHeight() {
        const canvasContainerDiv = document.getElementsByClassName('canvas-container')[0];

        if (!this.initialCanvasWidth)
            this.initialCanvasWidth = canvasContainerDiv['offsetWidth'];

        if (!this.initialCanvasHeight)
            this.initialCanvasHeight = canvasContainerDiv['offsetHeight'];

        let maxHeightPossible = canvasContainerDiv['offsetHeight'];
        let maxWidthPossible = canvasContainerDiv['offsetWidth'];

        //ratio and proportions property
        //multiplication of extremeties = multiplication of middle elements
        //imageWidth : imageHeight :: canvasWidth : canvasHeight
        //imageWidth * canvasHeight == imageHeight * canvasWidth

        let canvasWidthAfterTakingMaximumHeight = Math.ceil(this.imageFrames[this.currentFrameIndex].IMAGE_WIDTH * maxHeightPossible / this.imageFrames[this.currentFrameIndex].IMAGE_HEIGHT);
        let canvasHeightAfterTakingMaximumWidth = Math.ceil(this.imageFrames[this.currentFrameIndex].IMAGE_HEIGHT * maxWidthPossible / this.imageFrames[this.currentFrameIndex].IMAGE_WIDTH);

        if (canvasWidthAfterTakingMaximumHeight <= maxWidthPossible) {
            this.canvasHeight = maxHeightPossible;
            this.canvasWidth = canvasWidthAfterTakingMaximumHeight;
        }

        else if (canvasHeightAfterTakingMaximumWidth <= maxHeightPossible) {
            this.canvasHeight = canvasHeightAfterTakingMaximumWidth;
            this.canvasWidth = maxWidthPossible;
        }

        $('.canvas-container').css('max-height', this.canvasHeight);
        $('.canvas-container').css('max-width', this.canvasWidth);

        this.canvasImage = new Image(this.canvasWidth, this.canvasHeight);

        console.log(this.canvasHeight, this.canvasWidth);

        this.canvasOffset = $('.canvas-container').offset();
        this.offsetX = this.canvasOffset.left;
        this.offsetY = this.canvasOffset.top;
    }

    resetBoundingBoxAndFetchNewImage() {
        //internal function, fetches and sets the new image in the canvas.
        this.route.params.subscribe(params => {
            this.loadingService.show('Fetching image...');

            // this.imageFrames[this.currentFrameIndex].data = {};

            this.currentLabel = this.labels[0].LABEL_NAME;
            this.currentCategory = this.labels[0].LABEL_CATEGORY;
            this.currentColor = this.labels[0].LABEL_COLOR;

            this.ctx = this.canvas[0].getContext('2d');
            this.ctx2 = this.canvas2[0].getContext('2d');

            let vm = this;
            let labelName = this.currentLabel;
            let url = environment.oclaviServer + 'nextImage/' + params['id'] + '?projectId=' + this.projectId + '&edit=' + this.alreadyClassified;

            this.http.get(url, this.httpOptions).subscribe(res => {
                vm.loadingService.show('Processing the image...');

                this.metadata = res.json();

                console.log(this.metadata);

                this.objectDetails = {
                    timeSpentByUser: '00:00:00',
                    duration: this.getMiliseconds(this.metadata.duration.raw),
                    id: params['id']
                };

                // this.loadSementicSegmentations(res['data']);

                if (this.session.user.USER_TYPE === environment.USER_TYPE.FREELANCER.NAME && this.session.user.PROJECT_STATUS === 'TRAINING') {
                    this.getFreelancerTrainingImgData(params['id']);
                }
            }, err => {
                this.errorHandler(err, 'Error loading image...');
            });
        });
    }

    setImageToCanvas(base64Encoding) {
        let vm = this;

        this.canvasImage.src = base64Encoding;
        this.imageBaseEncoding = base64Encoding;

        this.canvasImage.onload = function() {
            vm.loadingService.show('Loading Image progress...');

            vm.canvas.width = vm.canvasWidth;
            vm.canvas.height = vm.canvasHeight;

            vm.ctx2.drawImage(this, 0, 0, vm.canvasWidth, vm.canvasHeight);
        }

        // if (this.session.user.USER_TYPE === environment.USER_TYPE.FREELANCER.NAME && this.session.user.PROJECT_STATUS === 'TRAINING') {
        //     this.getFreelancerTrainingImgData(params['id']);
        // }

        this.canvasImage.onerror = function(e) {
            vm.loadingService.hide();
            vm.alertService.show('error', 'Error while processing the image');
        }
    }

    drawSegmentation(imageData) {
        if (this.segmentationData.length !== 0) {
            const image = new Image();
            image.src = imageData;

            const imageWidth = image.width;
            const imageHeight = image.height;

            this.labels.forEach(label => {
                this.segmentationData.forEach(object => {
                    if (label.LABEL_NAME.toLowerCase() === object.class_name.toLowerCase()) {
                        // drawing segmentation if label matches with segmentation label
                        object.segmentation.forEach((coordinates) => {
                            let polygon = new Polygon();

                            for (let i = 0; i < coordinates.length; i += 2) {
                                polygon.drawStarted = true;
                                polygon.addCoordinate((coordinates[i] * 100) / imageWidth, (coordinates[i + 1] * 100) / imageHeight);
                            }

                            polygon.fromPercentage(this.canvasWidth, this.canvasHeight);
                            polygon.setTempCoordinate(((coordinates.length - 1) * 100) / imageWidth, ((coordinates.length - 2) * 100) / imageHeight);
                            polygon.fill(this.ctx, this.currentColor);
                            this.imageFrames[this.currentFrameIndex].data[label.LABEL_NAME].poly.push(polygon);
                        });
                    }
                });
            });
        }
    }

    loadImageTaggingProgress(response) {
        this.imageFrames.forEach((imageFrame) => {
            this.labels.forEach(label => {
                imageFrame.data[label.LABEL_NAME] = false;
            });
        });

        if (Object.keys(response.data).length > 0) {
            this.imageFrames[this.currentFrameIndex].data = response.data;
            this.startInactivityTimer();
            this.startTimer(response.SECONDS, response.MINUTES, response.HOURS);
        } else {
            this.startInactivityTimer();
            this.startTimer(null, null, null);
        }
    }

    loadSegmentationProjectProgress(response) {
        if (response.FRAMES.length > 0) {
            this.imageFrames.forEach((imageFrame, index) => {
                this.labels.forEach((label) => {
                    imageFrame.data[label.LABEL_NAME] = {};

                    if (this.session.admin.SUBSCRIPTION_FLAG.SHAPES.RECTANGLE) {
                        imageFrame.data[label.LABEL_NAME].rect = new Array<Rectangle>();

                        if (response.FRAMES[index].data[label.LABEL_NAME] && response.FRAMES[index].data[label.LABEL_NAME].rect) {
                            response.FRAMES[index].data[label.LABEL_NAME].rect.forEach((variable) => {
                                let rectangle = new Rectangle();

                                rectangle.setStartPoint(variable.startX, variable.startY);
                                rectangle.setWidthHeight(variable.width, variable.height);
                                rectangle.fromPercentage(this.canvasWidth, this.canvasHeight);

                                this.imageFrames[index].data[label.LABEL_NAME].rect.push(rectangle);
                            });
                        }
                    }

                    if (this.session.admin.SUBSCRIPTION_FLAG.SHAPES.POLYGON) {
                        imageFrame.data[label.LABEL_NAME].poly = new Array<Polygon>();

                        if (response.FRAMES[index].data[label.LABEL_NAME] && response.FRAMES[index].data[label.LABEL_NAME].poly) {
                            response.FRAMES[index].data[label.LABEL_NAME].poly.forEach((variable) => {
                                let polygon = new Polygon();

                                variable.forEach((coordinate) => {
                                    polygon.addCoordinate(coordinate.x, coordinate.y);
                                });

                                polygon.fromPercentage(this.canvasWidth, this.canvasHeight);
                                this.imageFrames[index].data[label.LABEL_NAME].poly.push(polygon);
                            });
                        }
                    }

                    if (this.session.admin.SUBSCRIPTION_FLAG.SHAPES.CIRCLE) {
                        imageFrame.data[label.LABEL_NAME].circle = new Array<Circle>();

                        if (response.FRAMES[index].data[label.LABEL_NAME] && response.FRAMES[index].data[label.LABEL_NAME].circle) {
                            response.FRAMES[index].data[label.LABEL_NAME].circle.forEach((variable) => {
                                let circle = new Circle();

                                circle.setCentre(variable.centreX, variable.centreY);
                                circle.setRadius(variable.radius);
                                circle.fromPercentage(this.canvasWidth, this.canvasHeight);

                                this.imageFrames[index].data[label.LABEL_NAME].circle.push(circle);
                            });
                        }
                    }

                    if (this.session.admin.SUBSCRIPTION_FLAG.SHAPES.POINT) {
                        imageFrame.data[label.LABEL_NAME].point = new Array<Point>();

                        if (response.FRAMES[index].data[label.LABEL_NAME] && response.FRAMES[index].data[label.LABEL_NAME].point) {
                            response.FRAMES[index].data[label.LABEL_NAME].point.forEach((variable) => {
                                let point = new Point();
                                point.setCentre(variable.centreX, variable.centreY);
                                point.fromPercentage(this.canvasWidth, this.canvasHeight);

                                this.imageFrames[index].data[label.LABEL_NAME].point.push(point);
                            });
                        }
                    }

                    if (this.session.admin.SUBSCRIPTION_FLAG.SHAPES.CUBOID) {
                        imageFrame.data[label.LABEL_NAME].cuboid = new Array<Cuboid>();

                        if (response.FRAMES[index].data[label.LABEL_NAME] && response.FRAMES[index].data[label.LABEL_NAME].cuboid) {
                            response.FRAMES[index].data[label.LABEL_NAME].cuboid.forEach((variable) => {
                                let cuboid = new Cuboid();
                                cuboid.setStartPoint(variable.rect1.x, variable.rect1.y);
                                cuboid.setWidthHeight(variable.rect1.width, variable.rect1.height);
                                cuboid.setStartPoint(variable.rect2.x, variable.rect2.y);
                                cuboid.setWidthHeight(variable.rect2.width, variable.rect2.height);
                                cuboid.fromPercentage(this.canvasWidth, this.canvasHeight);

                                this.imageFrames[index].data[label.LABEL_NAME].cuboid.push(cuboid);
                            });
                        }
                    }
                });
            });

            this.drawAll();
            this.startTimer(response.SECONDS, response.MINUTES, response.HOURS);
        }

        else {
            this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

            this.startInactivityTimer();
            this.startTimer(null, null, null);
        }
    }

    loadProgress() {
        this.loadingService.show('Loading progress of image...');

        this.http.get(environment.oclaviServer + 'progress/' + this.objectDetails['id'] + '?edit=' + this.alreadyClassified, this.httpOptions).subscribe(res => {
            const jsonData = res.json();

            if (this.alreadyClassified) {
                // If image is already classified, formatting classified data as image coming from working collection

                const obj = {};
                if (this.session.admin.PROJECTS[this.projectId].PROJECT_TYPE == environment.PROJECT_TYPE.image_segmentation) {
                    jsonData.data.forEach(label => {
                        obj[label.LABEL_NAME] = {};
                        for (let key in label) {
                            if (key != 'LABEL_NAME') {
                                obj[label.LABEL_NAME][environment.SHAPES[key]] = label[key];
                            }
                        }
                    });
                    jsonData.data = obj;
                }

                this.loadClassifiedImageProgress(jsonData);
            } else {
                // If image is new or coming from working images collection
                //fetches the saved progress on that image. Progress is saved using autosave feature
                if (this.session.admin.PROJECTS[this.projectId].PROJECT_TYPE == environment.PROJECT_TYPE.image_tagging) {
                    // If project type is tagging
                    this.loadImageTaggingProgress(jsonData);
                }
                else {
                    // If project type is segmentation
                    this.loadSegmentationProjectProgress(jsonData);
                }

                this.showLayers = true;
            }

            this.loadingService.hide();

            this.startAutoSave();
        }, err => {
            this.loadingService.hide();

            this.errorHandler(err, 'Unexpected error while setting image to canvas');
        });
    }

    loadClassifiedImageProgress(response) {
        // If project type is tagging
        if (this.session.admin.PROJECTS[this.projectId].PROJECT_TYPE == environment.PROJECT_TYPE.image_tagging) {
            this.labels.forEach(label => {
                this.imageFrames[this.currentFrameIndex].data[label.LABEL_NAME] = false;
            });

            if (Object.keys(response.data).length > 0) {
                this.imageFrames[this.currentFrameIndex].data = response.data[0];
                const hours = Math.floor(response.CLASSIFICATION_TIME / (60 * 60));
                const divisor_for_minutes = response.CLASSIFICATION_TIME % (60 * 60);
                const minutes = Math.floor(divisor_for_minutes / 60);
                const divisor_for_seconds = divisor_for_minutes % 60;
                const seconds = Math.ceil(divisor_for_seconds);
                this.startInactivityTimer();
                this.startTimer(seconds, minutes, hours);
            } else {
                this.startInactivityTimer();
                this.startTimer(null, null, null);
            }
        }
        else {
            // If project type is segmentation
            // Classified data is in different format, So converting it like data coming from Working Image collection
            this.labels.forEach(label => {
                this.imageFrames[this.currentFrameIndex].data[label.LABEL_NAME] = {}

                if (this.session.admin.SUBSCRIPTION_FLAG.SHAPES.RECTANGLE)
                    this.imageFrames[this.currentFrameIndex].data[label.LABEL_NAME].rect = new Array<Rectangle>();

                if (this.session.admin.SUBSCRIPTION_FLAG.SHAPES.POLYGON)
                    this.imageFrames[this.currentFrameIndex].data[label.LABEL_NAME].poly = new Array<Polygon>();

                if (this.session.admin.SUBSCRIPTION_FLAG.SHAPES.CIRCLE)
                    this.imageFrames[this.currentFrameIndex].data[label.LABEL_NAME].circle = new Array<Circle>();

                if (this.session.admin.SUBSCRIPTION_FLAG.SHAPES.POINT)
                    this.imageFrames[this.currentFrameIndex].data[label.LABEL_NAME].point = new Array<Point>();

                if (this.session.admin.SUBSCRIPTION_FLAG.SHAPES.CUBOID)
                    this.imageFrames[this.currentFrameIndex].data[label.LABEL_NAME].cuboid = new Array<Cuboid>();
            });

            console.log('progress');
            console.log(response.data);
            const imageHeight = response.IMAGE_HEIGHT;
            const imageWidth = response.IMAGE_WIDTH;

            if (Object.keys(response.data).length > 0) {
                this.labels.forEach((label) => {
                    if (response.data[label.LABEL_NAME]) {
                        this.session.admin.SUBSCRIPTION_FLAG.SHAPES.RECTANGLE && response.data[label.LABEL_NAME].rect && response.data[label.LABEL_NAME].rect.forEach((variable, index) => {
                            let rectangle = new Rectangle();

                            rectangle.setStartPoint((variable.START_X * 100) / imageWidth, (variable.START_Y * 100) / imageHeight);
                            rectangle.setWidthHeight((variable.WIDTH * 100) / imageWidth, (variable.HEIGHT * 100) / imageHeight);
                            rectangle.fromPercentage(this.canvasWidth, this.canvasHeight);

                            console.log(rectangle);

                            this.imageFrames[this.currentFrameIndex].data[label.LABEL_NAME].rect.push(rectangle);
                        });

                        this.session.admin.SUBSCRIPTION_FLAG.SHAPES.POLYGON && response.data[label.LABEL_NAME].poly && response.data[label.LABEL_NAME].poly.forEach((variable, index) => {
                            let polygon = new Polygon();

                            variable.COORDINATES.forEach((coordinate) => {
                                polygon.addCoordinate((coordinate.X * 100) / imageWidth, (coordinate.Y * 100) / imageHeight);
                            });

                            polygon.fromPercentage(this.canvasWidth, this.canvasHeight);
                            this.imageFrames[this.currentFrameIndex].data[label.LABEL_NAME].poly.push(polygon);
                        });

                        this.session.admin.SUBSCRIPTION_FLAG.SHAPES.CIRCLE && response.data[label.LABEL_NAME].circle && response.data[label.LABEL_NAME].circle.forEach((variable, index) => {
                            let circle = new Circle();

                            circle.setCentre((variable.CENTER_X * 100) / imageWidth, (variable.CENTRE_Y * 100) / imageHeight);
                            circle.setRadius((variable.RADIUS * 100) / imageWidth);
                            circle.fromPercentage(this.canvasWidth, this.canvasHeight);

                            this.imageFrames[this.currentFrameIndex].data[label.LABEL_NAME].circle.push(circle);
                        });

                        this.session.admin.SUBSCRIPTION_FLAG.SHAPES.POINT && response.data[label.LABEL_NAME].point && response.data[label.LABEL_NAME].point.forEach((variable, index) => {
                            let point = new Point();
                            point.setCentre((variable.CENTER_X * 100) / imageWidth, (variable.CENTRE_Y * 100) / imageHeight);
                            point.fromPercentage(this.canvasWidth, this.canvasHeight);

                            this.imageFrames[this.currentFrameIndex].data[label.LABEL_NAME].point.push(point);
                        });

                        this.session.admin.SUBSCRIPTION_FLAG.SHAPES.CUBOID && response.data[label.LABEL_NAME].cuboid && response.data[label.LABEL_NAME].cuboid.forEach((variable, index) => {
                            let cuboid = new Cuboid();
                            cuboid.setStartPoint((variable.RECT1.START_X * 100) / imageWidth, (variable.RECT1.START_Y * 100) / imageHeight);
                            cuboid.setWidthHeight((variable.RECT1.WIDTH * 100) / imageWidth, (variable.RECT1.HEIGHT * 100) / imageHeight);
                            cuboid.setStartPoint((variable.RECT2.START_X * 100) / imageWidth, (variable.RECT2.START_Y * 100) / imageHeight);
                            cuboid.setWidthHeight((variable.RECT2.WIDTH * 100) / imageWidth, (variable.RECT2.HEIGHT * 100) / imageHeight);
                            cuboid.fromPercentage(this.canvasWidth, this.canvasHeight);

                            this.imageFrames[this.currentFrameIndex].data[label.LABEL_NAME].cuboid.push(cuboid);
                        });
                    }
                });

                const hours = Math.floor(response.CLASSIFICATION_TIME / (60 * 60));
                const divisor_for_minutes = response.CLASSIFICATION_TIME % (60 * 60);
                const minutes = Math.floor(divisor_for_minutes / 60);
                const divisor_for_seconds = divisor_for_minutes % 60;
                const seconds = Math.ceil(divisor_for_seconds);

                this.drawAll();
                this.startTimer(seconds, minutes, hours);
            }

            else {
                this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

                this.startInactivityTimer();
                this.startTimer(null, null, null);
            }
        }

        this.showLayers = true;
    }

    startAutoSave() {
        //autosave runs every few seconds and saves the image progress so as to provide a better experience
        this.stopAutoSave();

        if (this.autoSaveTimer == null) {
            this.autoSaveTimer = setInterval((() => {
                var data = {
                    SECONDS: this.seconds,
                    MINUTES: this.minutes,
                    HOURS: this.hours,
                    USER_OID: this.imageFrames[0].USER_OID,
                    OBJECT_OID: this.objectDetails['id'],
                    PROJECT_ID: this.projectId,
                    FRAMES: new Array(),
                    PROJECT_TYPE: this.session.admin.PROJECTS[this.projectId].PROJECT_TYPE
                }

                this.imageFrames.forEach((imageFrame, index) => {
                    data.FRAMES.push({
                        OBJECT_OID: imageFrame.OBJECT_OID,
                        data: {}
                    });

                    if (Object.keys(imageFrame.data).length > 0)
                        this.downScaleCoordinates(imageFrame, data.FRAMES[index]);
                });

                this.socket.emit('saveClassificationProgress', data);

                this.notify.info('Auto Saved Changes...');
            }), environment.autoSaveTime);
        }
    }

    stopAutoSave() {
        //stops autosave
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);

            this.autoSaveTimer = null;
        }
    }

    errorHandler(response, message) {
        //general purpose error handler
        this.loadingService.hide();

        if (typeof response['_body'] == 'string')
            response = response.json();

        if (response.statusCode == 401)
            this.router.navigate(['login']);

        else if (Object.keys(response).length > 0) {
            var text = response.message;

            if (text != '')
                this.notify.error(null, text);

            else
                this.notify.error(null, message);
        }

        else
            this.notify.error(null, message);
    }

    downScaleCoordinates(source, destination) {
        console.log({ source, destination });

        // If project type is segmentation
        if (this.session.admin.PROJECTS[this.projectId].PROJECT_TYPE == environment.PROJECT_TYPE.image_segmentation) {
            this.labels.forEach((label) => {
                destination.data[label.LABEL_NAME] = {};

                this.shapes.forEach(shape => {
                    destination.data[label.LABEL_NAME][shape] = new Array();

                    source.data[label.LABEL_NAME][shape] && source.data[label.LABEL_NAME][shape].forEach((variable) => {
                        variable.toPercentage(this.canvasWidth, this.canvasHeight);
                        destination.data[label.LABEL_NAME][shape].push(JSON.parse(variable.toJsonString()));
                    });
                });
            });
        } else {
            destination.data = source.data;
        }
    }

    ngAfterViewInit() {
        // For toggling sidebar
        const buttons = ['#area_of_info_button', '#histogram_button', '#layers_button'];

        for (let i = 0; i < buttons.length; i++) {
            $(buttons[i]).on('click', function() {
                $(buttons[i]).toggleClass('rotate');
            });
        }
    }

    toggleSidebar() {
        if (!$('.sidebar').hasClass('open')) {
            $('.show_layers').addClass('active');
        } else {
            $('.show_layers').removeClass('active');
        }
        $('.sidebar').toggleClass('open');
    }

    getFreelancerTrainingImgData(imageId) {
        this.freelancerDataService.getFreelancerTrainingImgData(imageId).subscribe(res => {
            this.referenceImageData = res.data;
        }, err => {
            this.errorHandler(err, 'Error ocuured while getting classified data!');
        });
    }

    skipImage() {
        const userType = this.session.user.USER_TYPE;

        this.stopTimer();
        this.stopAutoSave();

        const data: any = {   // If user hasn't drawn any shape, set image status to 'NEW' and fetch new Image
            OBJECT_OID: this.imageFrames[this.currentFrameIndex].OBJECT_OID,
            STATUS: 'NEW',
            PROJECT_ID: this.projectId
        };

        if (this.isAreaSelected()) {    // If user has drawn shapes, won't be able to skip image
            this.notify.error('An annotated image can\'t be skipped!');
            return;
        }

        this.loadingService.show('Fetching next image...');
        this.showLayers = false;

        this.http.post(environment.oclaviServer + 'skipImage', data, this.httpOptions).subscribe(res => {
            $('.canvas-container').css('max-height', this.initialCanvasHeight);
            $('.canvas-container').css('max-width', this.initialCanvasWidth);

            this.router.navigate([res.json().redirect]);
        }, err => {
            this.errorHandler(err, 'Error fetching new image...');
        });
    }

    selectTags(labelName: string, value: boolean) {
        this.imageFrames[this.currentFrameIndex].data[labelName] = value;
        this.startInactivityTimer();
    }

    hotkeys(event) {
        // Keyboard shortcuts

        // shift + plus
        if (event.keyCode == 187 && event.shiftKey) {
            this.zoomPlus();
        }
        // shift + minus
        if (event.keyCode == 189 && event.shiftKey) {
            this.zoomMinus();
        }
        // shift + arrow right
        if (event.keyCode == 39 && event.shiftKey) {
            this.moveImage(-this.moveStep, 0);
        }
        // shift + arrow left
        if (event.keyCode == 37 && event.shiftKey) {
            this.moveImage(this.moveStep, 0);
        }
        // shift + arrow up
        if (event.keyCode == 38 && event.shiftKey) {
            this.moveImage(0, this.moveStep);
        }
        // shift + arrow down
        if (event.keyCode == 40 && event.shiftKey) {
            this.moveImage(0, -this.moveStep);
        }
        // backspace
        if (event.keyCode == 8) {
            this.removeObject();
        }
        // ctrl + z
        if (event.keyCode == 90 && event.ctrlKey) {
            this.undo();
        }

    }

    initTour() {
        var productTour = new ProductTour({
            overlay: true,
            onStart: function() { },
            onChanged: function(e) { },
            onClosed: (e) => {
                this.appService.setCookies('oclavi-classify-tour', 1);
            }
        });

        productTour.steps([
            {
                element: '#pt-label-dropdown',
                title: 'Label Name',
                content: 'Select the label from the list for which you want to classify the image',
                position: 'bottom'
            },
            {
                element: '.clear-all',
                title: 'Clear Annotations',
                content: 'Click here to clear all the annotations for a particular label',
                position: 'bottom'
            },
            // {
            //     element: '#canvasImage',
            //     title: 'Image to classify',
            //     content: 'Image area to annotate which is scaled by percentage',
            //     position: 'top'
            // },
            // {
            //     element: '.shapes',
            //     title: 'Shapes',
            //     content: 'Choose either rectangular or polygon from here to annotate and is draggable',
            //     position: 'left'
            // },
            // {
            //     element: '.next',
            //     title: 'Next Image',
            //     content: 'Upon completion of annotating the current image, click here to get the next image in queue',
            //     position: 'top'
            // }
        ]);

        productTour.startTour();

    }

    changeImageFrame(value, next) {
        if (value == 0 || (value && value < this.imageFrames.length))
            this.currentFrameIndex = value;

        else if (next && this.currentFrameIndex < this.imageFrames.length - 1)
            this.currentFrameIndex++;

        else if (!next && this.currentFrameIndex > 1)
            this.currentFrameIndex--;

        else {
            this.pauseVideo();
            return;
        }

        this.setImageToCanvas(this.imageFrames[this.currentFrameIndex].base64Encoding);
    }

    onSleekBarChange(event: any) {
        this.changeImageFrame(event.value, null);
    }

    playVideo() {
        if (this.videoPlaySettimeoutId)
            clearInterval(this.videoPlaySettimeoutId);

        if (this.currentFrameIndex == this.imageFrames.length - 1)
            this.currentFrameIndex = 0;

        var skipTime = Math.floor(this.objectDetails.duration / this.imageFrames.length / this.currentVideoSpeed);

        this.videoPlaySettimeoutId = setInterval(() => this.changeImageFrame(null, true), skipTime);
        this.isVideoPlaying = true;
    }

    pauseVideo() {
        if (this.videoPlaySettimeoutId)
            clearInterval(this.videoPlaySettimeoutId);

        this.isVideoPlaying = false;
    }

    videoSpeedChanged($event) {

    }
}
