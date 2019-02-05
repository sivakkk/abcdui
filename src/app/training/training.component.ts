import { Component, OnInit, ElementRef, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService } from '../alert.service';
import { AppService } from '../app-service.service';
import { NotificationsService } from 'angular2-notifications';
import { LoaderService } from '../loader.service';
import { environment } from '../../environments/environment';
import { Rectangle } from './rectangle';
import { variable } from '@angular/compiler/src/output/output_ast';


declare var $: any;
declare var io: any;

@Component({
    selector: 'app-training',
    templateUrl: './training.component.html',
    host: { '(window:keydown)': 'hotkeys($event)' },
    styleUrls: ['./training.component.scss']
})
export class TrainingComponent implements OnInit, AfterViewInit {
    imageBaseEncoding: string;
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
    pointerSelectedIndex: number;
    pointerSelectedShape: string;
    isMove: boolean;
    movePrevX: number;
    movePrevY: number;
    shape: string;
    zoomLevel = 0;
    scale = 1;
    zoomStep = 0.1;
    zoomThreshold = 1.5;
    zoomMultiplier: number;
    shapes: Array<string>;
    tempRectangle: Rectangle;
    questions: any;
    coordinates: any;
    mode: string;
    canvas2: any;
    ctx2: any;
    vm: any;
    isDown = false;
    startX = 0;
    startY = 0;
    width = 0;
    height = 0;
    image: any;
    canvasImage: any;
    canvas: any;
    ctx: any;
    user: {};
    canvasOffset: any;
    imageClassifiedCount: number;
    offsetX: number;
    offsetY: number;
    scrollX: number;
    scrollY: number;
    mouseX: number;
    mouseY: number;
    // labels: any;
    canvasWidth: number;
    canvasHeight: number;
    currentLabel: string;
    dummy: any;
    httpOptions: RequestOptions;
    socket: any;
    session: any;
    timer: any;
    autoSaveTimer: any;
    seconds: number;
    minutes: number;
    hours: number;
    @ViewChild('classifiedImagesCanvas') classifiedImagesCanvas: ElementRef;
    context: any;
    amountLoaded = 0;
    startPosition = 4.72;
    x: number;
    y: number;
    diff: number;
    progress: number;
    moveStep = 20;
    closestCoordinate: number;
    resizeStart: boolean;
    showLayers: boolean;
    environment;
    inactivityTimer: any;
    initialCanvasWidth: number;
    initialCanvasHeight: number;

    userAvatar = "../../assets/profile.png";

    constructor(private http: Http, private router: Router, private route: ActivatedRoute, private appService: AppService, private loadingService: LoaderService, private alertService: AlertService, private notify: NotificationsService) {
        this.socket = appService.getSocket();
        // This page is Only for freelancer
        var userData = localStorage.getItem('user');
        if (userData != null) {
            var parseData = JSON.parse(userData);
            this.session = {
                user: parseData
            }

            if (parseData['USER_TYPE'] !== "freelancer") {
                this.router.navigateByUrl('/');
            }

            if (parseData['USER_AVATAR'] != undefined) {
                this.userAvatar = environment.oclaviServer + 'avatar/' + parseData['USER_AVATAR'];
                parseData['USER_AVA'] = this.userAvatar;
            } else {
                parseData['USER_AVA'] = this.userAvatar;
            }


        } else {
            this.router.navigateByUrl("/freelancer/login");
        }

        this.image = {
            startTime: new Date(),
            timer: '00:00:00',
            data: {
            }
        };

        this.user = {
            type: 'single',
            name: 'Monica Gallor',
            email: 'monica@gmail.com',
            imageCount: 100,
            imageClassified: 15
        };

        this.coordinates = [];
    }

    // Keyboard shortcuts
    hotkeys(event) {
        // plus + shift
        if (event.keyCode == 187 && event.shiftKey) {
            this.zoomPlus();
        }
        // minus + shift
        if (event.keyCode == 189 && event.shiftKey) {
            this.zoomMinus();
        }
        // arrow right + shift
        if (event.keyCode == 39 && event.shiftKey) {
            this.moveImage(-this.moveStep, 0);
        }
        // arrow left + shift
        if (event.keyCode == 37 && event.shiftKey) {
            this.moveImage(this.moveStep, 0);
        }
        // arrow up + shift
        if (event.keyCode == 38 && event.shiftKey) {
            this.moveImage(0, this.moveStep);
        }
        // arrow down + shift
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

    ngOnInit() {
        this.environment = environment;
        this.showLayers = false;
        // this.canvasWidth = window.innerWidth * 0.9;
        // this.canvasHeight = window.innerHeight * 0.7;
        this.zoomMultiplier = this.scale + this.zoomStep;
        this.canvas = $('#canvas');
        this.canvas2 = $('#canvasImage');
        this.canvasImage = new Image(this.canvasWidth, this.canvasHeight);
        this.totalMoveX = 0;
        this.totalMoveY = 0;
        this.httpOptions = new RequestOptions({ withCredentials: true });
        this.getTrainingQuestions();    // Getting training questions

        // console.log(this.canvasWidth, this.canvasHeight);

        this.socket.on('multipleSession', (data) => {
            this.alertService.show('error', 'Multiple Session Detected.');
        });

        this.tempRectangle = new Rectangle();   //Rectangle where the objects are stored

    }

    bindHandlers() {
        this.canvas.off('mouseup');
        this.canvas.off('mousedown');
        this.canvas.off('mousemove');
        this.canvas.off('mouseout');

        this.canvas.on('mousedown', this.mouseDownHandler.bind(this));
        this.canvas.on('mousemove', this.mouseMoveHandler.bind(this));
        this.canvas.on('mouseup', this.mouseUpEventHandler.bind(this));
        this.canvas.on('mouseout', this.mouseOutEventHandler.bind(this));
    }

    mouseDownHandler(e) {
        e.preventDefault();
        e.stopPropagation();

        let mouseX = e.pageX - this.offsetX;
        let mouseY = e.pageY - this.offsetY;

        //Methods for other shapes are commented for future use
        // if (this.mode == 'polygon' && this.session.admin.SUBSCRIPTION_FLAG.SHAPES.POLYGON) {
        //     this.tempPolygon.drawStarted = true;
        //     this.tempPolygon.addCoordinate(mouseX, mouseY);
        //     this.tempPolygon.draw(this.ctx, this.scale, this.image.data[this.currentLabel].poly.length);
        // }

        if (this.mode == 'move') {
            this.isMove = true;
            this.movePrevX = mouseX;
            this.movePrevY = mouseY;
        }

        else if (this.mode == 'RECTANGLE') {
            this.tempRectangle.drawStarted = true;
            this.tempRectangle.setStartPoint(mouseX, mouseY);
        }
        //Methods for other shapes are commented for future use
        // else if (this.mode == 'circle' && this.session.admin.SUBSCRIPTION_FLAG.SHAPES.CIRCLE) {
        //     this.tempCirlce.drawStarted = true;
        //     this.tempCirlce.setCentre(mouseX, mouseY);
        //     this.tempCirlce.setRadius(0);
        // }
        else if (this.mode == 'pointer') {  //logic for resize feature
            this.selectShape(mouseX, mouseY);
            if (this.pointerSelectedShape == 'RECTANGLE') {
                this.tempRectangle = this.image.data[this.pointerSelectedShape][this.pointerSelectedIndex];
                this.image.data[this.pointerSelectedShape].push(this.tempRectangle);
                this.image.data[this.pointerSelectedShape].splice(this.pointerSelectedIndex, 1);

                this.closestCoordinate = this.tempRectangle.findClosestCoordinate(this.scale, mouseX, mouseY);    //gets closest coordinate incase of a Rectangle

            }
            this.resizeStart = true;
        }
        else if (this.mode == 'pointer') {
            this.selectShape(mouseX, mouseY);
        }

        else
            alert('No mode has been selected');
    }

    mouseMoveHandler(e) {
        if (this.tempRectangle.drawStarted || this.isMove) {
            e.preventDefault();
            e.stopPropagation();

            let mouseX = e.pageX - this.offsetX;
            let mouseY = e.pageY - this.offsetY;

            if (this.tempRectangle.drawStarted) {
                this.drawAll();

                this.tempRectangle.setWidthHeight(mouseX - this.tempRectangle.getStartX(), mouseY - this.tempRectangle.getStartY());
                this.tempRectangle.fill(this.ctx);
            }

            //Methods for other shapes are commented for future use
            // else if (this.tempPolygon.drawStarted) {
            //     this.drawAll();
            //     this.tempPolygon.setTempCoordinate(mouseX, mouseY);
            //     this.tempPolygon.draw(this.ctx, this.scale, this.image.data[this.currentLabel].poly.length);
            //     this.tempPolygon.fill(this.ctx);
            // }

            else if (this.isMove) {
                this.moveImage(mouseX - this.movePrevX, mouseY - this.movePrevY);

                this.movePrevX = mouseX;
                this.movePrevY = mouseY;
            }

            else if (this.mode == 'pointer' && this.resizeStart) {
               if (this.pointerSelectedShape == 'RECTANGLE') {
                    this.tempRectangle.resizeShape(this.scale, mouseX, mouseY, this.closestCoordinate);
                    //resizes the rectangle
                    this.image.data[this.currentLabel][this.pointerSelectedShape].pop()
                    this.image.data[this.currentLabel].rect.push(this.tempRectangle);
                }
                this.drawAll()
            }
            //Methods for other shapes are commented for future use
            // else if (this.tempCirlce.drawStarted) {
            //     this.drawAll();
            //     this.tempCirlce.setCircumferencePoint(mouseX, mouseY);
            //     this.tempCirlce.fill(this.ctx);
            // }
        }
    }

    mouseUpEventHandler(e) {
        e.preventDefault();
        e.stopPropagation();
        this.showLayers = true;

        if (this.mode == 'RECTANGLE' && this.tempRectangle.drawStarted) {
            this.tempRectangle.scaleCoordinates(Math.pow(this.zoomMultiplier, -this.zoomLevel));

            this.image.data[this.shape].push(this.tempRectangle);
            this.tempRectangle = new Rectangle();

            // this.lastShape.push('rect');
            this.drawAll();
        }

        else if (this.mode == 'move' && this.isMove) {
            this.isMove = false;
            this.mode = this.questions.item[0]['TOOL_TYPE'];
        }

        else if (this.mode == 'pointer') {
            //frees the temp object so that it can be used for further operations
            this.resizeStart = false;
            if (this.pointerSelectedShape == 'RECTANGLE')
                this.tempRectangle = new Rectangle();
        }

        //Methods for other shapes are commented for future use
        // else if (this.mode === 'circle' && this.tempCirlce.drawStarted) {
        //     this.tempCirlce.scaleCoordinates(Math.pow(this.zoomMultiplier, -this.zoomLevel));

        //     this.drawAll();
        //     this.lastShape.push('circle');
        //     this.tempCirlce.draw(this.ctx, this.scale, this.image.data[this.currentLabel].circle.length);
        //     this.image.data[this.currentLabel].circle.push(this.tempCirlce);
        //     this.tempCirlce = new Circle();
        // }
    }

    mouseOutEventHandler(e) {
        e.preventDefault();
        e.stopPropagation();

        //Methods for other shapes are commented for future use
        // if (this.mode === 'polygon' && this.tempPolygon.drawStarted) {

        //     if (this.scale == 1) {
        //         this.image.data[this.currentLabel].poly.push(this.tempPolygon);
        //         this.tempPolygon = new Polygon();
        //     }

        // else {
        //     this.tempPolygon.scaleCoordinates(Math.pow(this.zoomMultiplier, -this.zoomLevel));
        //     this.image.data[this.currentLabel].poly.push(this.tempPolygon);

        //     this.tempPolygon = new Polygon();
        // }

        // this.lastShape.push('poly');

        // this.drawAll();

    }

    zoomPlus() {

        if (this.scale >= this.zoomThreshold)
            return;
        this.scale = this.getFloatValue(this.scale + this.zoomStep, 1);
        this.zoomLevel++;

        this.image.data[this.shape].forEach((variable) => variable.zoom('plus', this.zoomMultiplier, this.totalMoveX, this.totalMoveY));

        this.zoomImage();
    }

    zoomMinus() {
        if (this.scale <= 1)
            return;
        this.scale = this.getFloatValue(this.scale - this.zoomStep, 1);
        this.zoomLevel--;

        this.image.data[this.shape].forEach(variable => variable.zoom('minus', this.zoomMultiplier, this.totalMoveX, this.totalMoveY));

        this.zoomImage();
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

    changeMode(mode) {
        this.mode = mode;
        this.bindHandlers();
    }

    selectShape(mouseX, mouseY) {
        //Selects the shape
        if (this.pointerSelectedIndex)
            this.drawAll();

        this.pointerSelectedIndex = null;
        this.pointerSelectedShape = null;
        let flag = true;


        this.image.data[this.shape].every((variable, index) => {
            if (variable.isInside(this.scale, mouseX, mouseY)) {
                this.drawAll();

                variable.draw(this.ctx, this.scale, index, 'SELECT');
                this.pointerSelectedIndex = index;
                this.pointerSelectedShape = this.shape;
                flag = false;
            }

            return flag;
        });
    }

    moveImage(x = 0, y = 0) {
        //Logic for zooming and moving image
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

            this.image.data[this.shape].forEach((variable) => variable.moveCoordinates(temp, x, y));

            let vm = this;

            this.canvasImage.onload = function(evt) {
                vm.ctx2.translate(x, y);
                vm.ctx2.drawImage(this, 0, 0, vm.canvasWidth, vm.canvasHeight);
            }

            this.drawAll();
        }
    }

    getTrainingQuestions() {
        //Fetches a random sample of 5(or whatever is defined in the config) questions and their data
        this.httpOptions = new RequestOptions({ withCredentials: true });
        this.http.post(environment.oclaviServer + 'training', {}, this.httpOptions).subscribe(res => {
            console.log(res.json());
            this.questions = res.json();
            if (this.questions.item && this.questions.item.length > 0) {
                this.resetBoundingBoxAndFetchNewImage();
            }
        }, err => {
            console.log('err', err);
            this.errorHandler(err);
        });
    }

    startTimer(seconds, minutes, hours) {
        this.stopTimer();

        this.seconds = seconds ? seconds : 0;
        this.minutes = minutes ? minutes : 0;
        this.hours = hours ? hours : 0;

        this.timer = setInterval(() => {
            this.seconds++;

            if (this.seconds >= 60) {
                this.seconds = 0;
                this.minutes++;

                if (this.minutes >= 60) {
                    this.minutes = 0;
                    this.hours++;
                }
            }

            this.image.timer = (this.hours ? (this.hours > 9 ? this.hours : '0' + this.hours) : '00')
                + ':' + (this.minutes ? (this.minutes > 9 ? this.minutes : '0' + this.minutes) : '00')
                + ":" + (this.seconds > 9 ? this.seconds : '0' + this.seconds);
        }, 1000);
    }

    stopTimer() {
        if (this.timer)
            clearInterval(this.timer);
    }


    undo() {
        //removes the last shape/object
        this.image.data[this.shape].pop();
        this.drawAll();
    }

    drawAll() {
        //draws every object again on the canvas
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.image.data[this.shape].forEach((variable, index) => variable.draw(this.ctx, this.scale, index));

        this.startInactivityTimer();
    }

    removeObject() {
        //Removes selected object
        if (this.mode == 'pointer') {
            if (this.pointerSelectedIndex != null) {
                this.image.data[this.shape].splice(this.pointerSelectedIndex, 1);

                this.pointerSelectedIndex = null;

                this.drawAll();

                this.mode = this.shape;
            }
        }
    }

    saveImage() {
        //This method stringifies the this.image object and sends it over to the server for it to be saved
        this.loadingService.show('Saving your classification...');

        if (this.isAreaSelected()) {
            this.stopTimer();
            this.image.endTime = new Date();
            this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

            this.http.post(environment.oclaviServer + 'saveImage', JSON.stringify(this.image), this.httpOptions).subscribe(res => {

                this.imageClassifiedCount++;
                this.router.navigate(['classify/' + res['_body']]);

                this.resetBoundingBoxAndFetchNewImage();
            }, err => {
                this.errorHandler(err);
            });
        } else
            alert('Please select some area.');
    }

    async checkUpdateCertification() {
        //This method checks whether the user has crossed the minimum no of questions required to advance to the next level
        if (this.questions.item.length === 0) {
            var tempCheckpoint = this.session.user.CHECKPOINT_PASSED;
            var tempCertLevel = this.session.user.CERT_LEVEL;
            await this.http.post(environment.oclaviServer + 'training/update', {}, this.httpOptions).subscribe(res => {
                this.session.user.CHECKPOINT_PASSED += 1;
                if (this.session.user.CHECKPOINT_PASSED === 4) {
                    this.notify.success("Congrats! You've advanced to the next level")
                    this.session.user.CHECKPOINT_PASSED = 0;
                    this.session.user.CERT_LEVEL += 1
                } else {
                    this.notify.success("Congrats! You've reached checkpoint "  + (this.session.user.CHECKPOINT_PASSED + 1))
                }
                // if (this.session.user.CHECKPOINT_PASSED === 5) {
                //     this.notify.success("Congrats! You've advanced to the next level")
                // } else {
                //     this.notify.success("Congrats! You've reached checkpoint "  + (temp_user.CHECKPOINT_PASSED + 1))
                // }

                this.getTrainingQuestions();
                this.resetBoundingBoxAndFetchNewImage();
            }, err => {
                console.log('err', err);
            })
        } else {
            this.resetBoundingBoxAndFetchNewImage();
        }
    }

    selectShapeFromLayers(index) {

        if (this.pointerSelectedShape === this.shape && this.pointerSelectedIndex === index) {
            this.drawAll();
            this.pointerSelectedIndex = null;
            this.pointerSelectedShape = null;
            return;
        }

        this.image.data[this.shape].forEach((variable, i) => {
            if (index === i) {
                this.drawAll();
                variable.draw(this.ctx, this.scale, index, 'SELECT');
                this.mode = 'pointer';
                this.pointerSelectedIndex = i;
                this.pointerSelectedShape = this.shape;
            }
        });
    }

    checkSelection(){
        if(this.mode === "RECTANGLE"){
            var tempRectangle = new Rectangle();
            var flag = tempRectangle.checkSelection(this.questions.item[0], this.image.data, this.canvasWidth, this.canvasHeight);
            if (flag) {
                this.notify.success('Success');
                this.questions.item.splice(0, 1);
                setTimeout(this.checkUpdateCertification(), 2000);
            } else {
                this.notify.error("Answer is wrong. Please click 'Clear All' and try again!");
            }
        }

        // Code for Polygon isn't fully implemented

        // if (this.mode === "POLYGON") {
        //     var x_centroid = 0, y_centroid = 0, x1_center = 0, y1_center = 0, j, perimeter = 0;
        //     if (this.questions.item[0].IMAGE_DETAILS.EDGES.length == this.image.data.poly.length) {
        //         for (var i = 0; i < this.image.data.poly.length; i++) {
        //             for (j = 0; j < this.image.data.poly[i].length; j++) {
        //                 x_centroid += this.image.data.poly[i][j].x
        //                 y_centroid += this.image.data.poly[i][j].y
        //                 if (j != this.image.data.poly[i].length - 1) {
        //                     perimeter += Math.sqrt(Math.pow((this.image.data.poly[i][j + 1].x - this.image.data.poly[i][j].x), 2) + Math.pow((this.image.data.poly[i][j + 1].y - this.image.data.poly[i][j].y), 2));
        //                 }
        //             }
        //             x_centroid /= j;
        //             y_centroid /= j;

        //             if (((perimeter - this.questions.item[0].IMAGE_DETAILS.EDGES[i].perimeter) / this.questions.item[0].IMAGE_DETAILS.EDGES[i].perimeter < 0.2)
        //                 && ((x_centroid - this.questions.item[0].IMAGE_DETAILS.EDGES[i].centroid_x) / this.questions.item[0].IMAGE_DETAILS.EDGES[i].centroid_x)
        //                 && ((y_centroid - this.questions.item[0].IMAGE_DETAILS.EDGES[i].centroid_y) / this.questions.item[0].IMAGE_DETAILS.EDGES[i].centroid_y)) {
        //                 console.log('success');
        //             } else {
        //                 flag = false
        //             }
        //         }

        //         if (flag) {
        //             this.checkUpdateCertification();
        //         }

        //     } else {

        //     }
        // }

    }

    resetImage() {
        // this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        //
        // this.canvasImage.src = this.imageBaseEncoding;
        //
        // this.imageWidth = this.getFloatValue(this.imageWidth * Math.pow(this.zoomMultiplier, -this.zoomLevel));
        // this.imageHeight = this.getFloatValue(this.imageHeight * Math.pow(this.zoomMultiplier, -this.zoomLevel));
        //
        // let vm = this;
        //
        // this.ctx2.setTransform(1, 0, 0, 1, 0, 0);
        //
        // this.canvasImage.onload = function(evt) {
        //     vm.ctx2.drawImage(this, 0, 0, vm.imageWidth, vm.imageHeight, 0, 0, vm.canvasWidth, vm.canvasHeight);
        // }
        //
        // this.scale = 1;
        // this.drawAll();
    }

    isAreaSelected() {
        //Checks if any objects are selected by the user
        if (this.image.data[this.shape].length > 0)
            return true;

        return false;
    }

    clearArea() {
        //Clears the canvas for if the user wants to start afresh
        this.image.data[this.shape] = new Array();
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    }

    resetBoundingBoxAndFetchNewImage() {
        this.showLayers = false;
        this.zoomLevel = 0;
        this.scale = 1;
        $('.canvas-container').css('max-height', this.initialCanvasHeight);
        $('.canvas-container').css('max-width', this.initialCanvasWidth);

        this.loadingService.show('Please wait. Fetching new image...');
        this.bindHandlers();
        this.image.data = {};

        this.mode = this.questions.item[0]['TOOL_TYPE'];
        this.shape = this.questions.item[0]['TOOL_TYPE'];
        this.image.data[this.questions.item[0]['TOOL_TYPE']] = new Array();

        let url = '';
        let vm = this;

        this.ctx = this.canvas[0].getContext('2d');
        this.ctx2 = this.canvas2[0].getContext('2d');
        this.canvasOffset = this.canvas.offset();
        this.offsetX = this.canvasOffset.left;
        this.offsetY = this.canvasOffset.top;
        this.scrollX = this.canvas.scrollLeft();
        this.scrollY = this.canvas.scrollTop();
        this.ctx.strokeStyle = '#FF0000';
        this.ctx.lineWidth = 3;
        this.zoomImage();

        this.httpOptions = new RequestOptions({ withCredentials: true });
        this.mode = this.questions.item[0]['TOOL_TYPE'];
        console.log(this.questions[0])
        this.http.post(environment.oclaviServer + 'training/next', { "ORIGINAL_OBJECT_NAME": this.questions.item[0]["ORIGINAL_OBJECT_NAME"] }, this.httpOptions).subscribe(res => {
            vm.loadingService.hide();
            res = JSON.parse(res['_body']);
            this.clearArea();

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

            let canvasWidthAfterTakingMaximumHeight = Math.ceil(this.questions.item[0].IMAGE_DETAILS.IMAGE_WIDTH * maxHeightPossible / this.questions.item[0].IMAGE_DETAILS.IMAGE_HEIGHT);
            let canvasHeightAfterTakingMaximumWidth = Math.ceil(this.questions.item[0].IMAGE_DETAILS.IMAGE_HEIGHT * maxWidthPossible / this.questions.item[0].IMAGE_DETAILS.IMAGE_WIDTH);

            if (canvasWidthAfterTakingMaximumHeight <= maxWidthPossible) {
                console.log('case 1');

                this.canvasHeight = maxHeightPossible;
                this.canvasWidth = canvasWidthAfterTakingMaximumHeight;
            }

            else if (canvasHeightAfterTakingMaximumWidth <= maxHeightPossible) {
                console.log('case 2');

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

            this.image.startTime = new Date();
            this.canvasImage.src = res['data'];
            this.imageBaseEncoding = res['data'];
            // console.log(this.questions.item[0]);
            // console.log(this.canvasWidth, this.canvasHeight);
            // console.log(this.questions.item[0].IMAGE_DETAILS.IMAGE_WIDTH, this.questions.item[0].IMAGE_DETAILS.IMAGE_LENGTH);
            // console.log(this.questions.item[0].IMAGE_DETAILS.IMAGE_WIDTH / this.canvasWidth, this.questions.item[0].IMAGE_DETAILS.IMAGE_LENGTH / this.canvasHeight);
            vm.canvasImage.onload = function() {
                vm.loadingService.hide();
                vm.canvas.width = vm.canvasWidth;
                vm.canvas.height = vm.canvasHeight;
                vm.ctx2.drawImage(this, 0, 0, vm.canvasWidth, vm.canvasHeight);
            }

            this.startInactivityTimer();
            this.startTimer(null, null, null);
        }, err => {
            console.log('err', err);
        });
    }

    startInactivityTimer() {
        this.stopInactivityTimer();

        if (this.inactivityTimer == null) {
            this.startTimer(this.seconds, this.minutes, this.hours);

            this.inactivityTimer = setTimeout(() => {
                this.stopTimer();

                this.inactivityTimer = null;
            }, environment.inactivityTime);
        }
    }

    stopInactivityTimer() {
        if (this.inactivityTimer) {
            clearInterval(this.inactivityTimer);

            this.startTimer(this.seconds, this.minutes, this.hours);

            this.inactivityTimer = null;
        }
    }

    ngAfterViewInit() {
        $('#toggle_sidebar_button').on('click', toggleSidebar);

        function toggleSidebar() {
            if (!$('.sidebar').hasClass('open')) {
                $('.show_layers').addClass('active');
            } else {
                $('.show_layers').removeClass('active');
            }
            $('.sidebar').toggleClass('open');
        }

        const buttons = ['#area_of_info_button', '#histogram_button', '#layers_button'];

        for (let i = 0; i < buttons.length; i++) {
            $(buttons[i]).on('click', function () {
                $(buttons[i]).toggleClass('rotate');
            });
        }
    }


    errorHandler(response) {
        this.loadingService.hide();

        if (response.status == 401)
            this.router.navigate(['login']);

        else
            console.log(response);
    }
}
