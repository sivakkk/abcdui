import { Shape } from './shape';
import { Coordinate } from './coordindate';
import { environment } from '../../environments/environment';
import { select } from 'd3';
import { ImageSettingsComponent } from '../image-settings/image-settings.component';

export class Rectangle implements Shape {
    public drawStarted: boolean;
    private coordinate: Coordinate;
    public width: number;
    private height: number;

    private clonedCoordinate: Coordinate;
    private clonedWidth: number;
    private clonedHeight: number;

    private zoomedCoordinate: Coordinate;
    private zoomedHeight: number;
    private zoomedWidth: number;

    private prevMouseX: number;
    private prevMouseY: number;

    constructor() {
        this.drawStarted = false;
        this.width = 0;
        this.height = 0;
        this.coordinate = new Coordinate(0, 0);
        this.clonedCoordinate = new Coordinate(0, 0);
    }

    setStartPoint(startX: number, startY: number) {
        this.coordinate = new Coordinate(startX, startY);
        this.zoomedCoordinate = new Coordinate(startX, startY);
    }

    setZoomStartPoint(startX: number, startY: number) {
        this.zoomedCoordinate = new Coordinate(startX, startY);
    }

    setWidthHeight(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.zoomedWidth = width;
        this.zoomedHeight = height;
    }

    setZoomWidthHeight(width: number, height: number) {
        this.zoomedWidth = width;
        this.zoomedHeight = height;
    }

    getStartX() {
        return this.coordinate.x;
    }

    getStartY() {
        return this.coordinate.y;
    }

    getWidth() {
        return this.width;
    }

    getHeight() {
        return this.height;
    }

    fill(context) {
        context.globalAlpha = 0.2;
        context.fillStyle = '#FBFF00';
        context.fillRect(this.coordinate.x, this.coordinate.y, this.width, this.height);
        context.globalAlpha = 1;
    }

    draw(context, scale: number, index: number, type = 'NORMAL') {
        context.strokeStyle = environment.CANVAS_SHAPE[type].STROKE_COLOR;
        context.fillStyle = environment.CANVAS_DOT[type].FILL_COLOR;
        context.lineWidth = environment.CANVAS_SHAPE[type].LINE_WIDTH;
        let arcWidth = environment.CANVAS_DOT[type].SIZE;

        let coordinate, width, height;

        if (scale == 1) {
            coordinate = this.coordinate;
            width = this.width;
            height = this.height;
        }

        else {
            coordinate = this.zoomedCoordinate;
            width = this.zoomedWidth;
            height = this.zoomedHeight;
        }

        context.strokeRect(coordinate.x, coordinate.y, width, height);

        var dotCoordindates = [
            [coordinate.x, coordinate.y],
            [coordinate.x + width, coordinate.y],
            [coordinate.x + width, coordinate.y + height],
            [coordinate.x, coordinate.y + height]
        ];

        dotCoordindates.forEach(coordinate => {
            context.beginPath();
            context.arc(coordinate[0], coordinate[1], arcWidth, 0, 2 * Math.PI);
            context.fill();
        });

        context.font = environment.CANVAS_TEXT[type].FONT;
        context.fillStyle = environment.CANVAS_TEXT[type].COLOR;
        context.fillText('R' + (index + 1), coordinate.x + (width / 2) - 5, coordinate.y - 5);
    }

    isInside(scale: number, x: number, y: number) {
        let coordinate, width, height;

        if (scale == 1) {
            coordinate = this.coordinate;
            width = this.width;
            height = this.height;
        }

        else {
            coordinate = this.zoomedCoordinate;
            width = this.zoomedWidth;
            height = this.zoomedHeight;
        }

        let a = coordinate.x <= x;
        let b = x <= (coordinate.x + width);
        let c = coordinate.y <= y;
        let d = y <= (coordinate.y + height);

        return a && b && c && d;
    }

    scaleCoordinates(zoomFactor: number) {
        this.coordinate = new Coordinate(zoomFactor * this.getStartX(), zoomFactor * this.getStartY());
        this.width *= zoomFactor;
        this.height *= zoomFactor;
    }

    zoom(type: string, zoomMultiplier: number, totalMoveX: number, totalMoveY: number) {
        let power = type == 'plus' ? 1 : -1;
        let multiplier = Math.pow(zoomMultiplier, power);

        this.zoomedCoordinate.x -= totalMoveX;
        this.zoomedCoordinate.y -= totalMoveY;

        this.zoomedCoordinate.x = this.zoomedCoordinate.x * multiplier;
        this.zoomedCoordinate.y = this.zoomedCoordinate.y * multiplier;
        this.zoomedWidth = this.zoomedWidth * multiplier;
        this.zoomedHeight = this.zoomedHeight * multiplier;
    }

    toPercentage(canvasWidth: number, canvasHeight: number) {
        this.clonedCoordinate.x = this.coordinate.x / canvasWidth * 100;
        this.clonedCoordinate.y = this.coordinate.y / canvasHeight * 100;
        this.clonedWidth = this.width / canvasWidth * 100;
        this.clonedHeight = this.height / canvasHeight * 100;
    }

    fromPercentage(canvasWidth: number, canvasHeight: number) {
        this.coordinate.x = this.coordinate.x * canvasWidth / 100;
        this.coordinate.y = this.coordinate.y * canvasHeight / 100;
        this.width = this.width * canvasWidth / 100;
        this.height = this.height * canvasHeight / 100;

        this.zoomedCoordinate.x = this.coordinate.x;
        this.zoomedCoordinate.y = this.coordinate.y;
        this.zoomedWidth = this.width;
        this.zoomedHeight = this.height;
    }

    toJsonString() {
        return JSON.stringify({
            startX: this.clonedCoordinate.x,
            startY: this.clonedCoordinate.y,
            width: this.clonedWidth,
            height: this.clonedHeight
        });
    }

    moveCoordinates(multiplier: number, x: number, y: number) {
        this.zoomedCoordinate.x += (x * multiplier);
        this.zoomedCoordinate.y += (y * multiplier);
    }

    getFloatValue(exp: number, precision = 3) {
        return parseFloat(exp.toFixed(precision));
    }

    findClosestCoordinate(scale: number, mouseX: number, mouseY: number) {
        mouseX = mouseX / scale;
        mouseY = mouseY / scale;

        const distances = [
            Math.abs(this.coordinate.y - mouseY),
            Math.abs(this.coordinate.x + this.width - mouseX),
            Math.abs(this.coordinate.y + this.height - mouseY),
            Math.abs(this.coordinate.x - mouseX),
        ];

        const indexOfMinValue = distances.reduce((iMin, x, i, arr) => x < arr[iMin] ? i : iMin, 0);

        return indexOfMinValue;
    }

    resizeShape(scale: number, mouseX: number, mouseY: number, closestCoordinate: number) {
        // console.log(arguments);

        switch (closestCoordinate) {
            case 0: {
                console.log(0 + ' is closestCoordinate');

                console.log(JSON.parse(JSON.stringify(this)));

                // resizing from top edge ==>> need to add the height to the previous height
                if (this.prevMouseY) {
                    this.height += ((this.prevMouseY - mouseY) / scale);
                    this.zoomedHeight += (this.prevMouseY - mouseY);

                    // y coordinate will change when we are re-sizing from right side
                    this.coordinate.y -= ((this.prevMouseY - mouseY) / scale);
                    this.zoomedCoordinate.y -= (this.prevMouseY - mouseY);
                }

                break;
            }

            case 1: {
                console.log(1 + ' is closestCoordinate');

                // resizing from right edge
                if (this.prevMouseX) {
                    this.width += ((mouseX - this.prevMouseX) / scale);
                    this.zoomedWidth += (mouseX - this.prevMouseX);
                }

                break;
            }

            case 2: {
                console.log(2 + ' is closestCoordinate');

                // resizing from bottom edge

                if (this.prevMouseY) {
                    this.height = this.height + ((mouseY - this.prevMouseY) / scale);
                    this.zoomedHeight = this.zoomedHeight + mouseY - this.prevMouseY;

                    console.log(this.height, this.zoomedHeight);
                }

                // console.log(this.height, this.zoomedHeight);

                break;
            }

            case 3: {
                console.log(3 + ' is closestCoordinate');

                // resizing from left edge
                if (this.prevMouseX) {
                    this.width += ((this.prevMouseX - mouseX) / scale);
                    this.zoomedWidth += (this.prevMouseX - mouseX);

                    // x coordinate will change when we are re-sizing from left side
                    this.coordinate.x -= (this.prevMouseX - mouseX) / scale;
                    this.zoomedCoordinate.x -= (this.prevMouseX - mouseX);
                }

                break;
            }

            default:
                break;
        }

        this.prevMouseX = mouseX;
        this.prevMouseY = mouseY;
    }

    checkSelection(imageObject: any, selections: any, canvasWidth: any, canvasHeight: any) {
        //This method checks the selections made by the user and if it is correct or not
        var i, j;
        var x_scale = imageObject.IMAGE_DETAILS.IMAGE_WIDTH / canvasWidth;
        var y_scale = imageObject.IMAGE_DETAILS.IMAGE_HEIGHT / canvasHeight;
        var imageDetails = {
            ...imageObject,
            IMAGE_DETAILS: {
                EDGES: [...imageObject.IMAGE_DETAILS.EDGES]
            }
        }

        var selectionClone = JSON.parse(JSON.stringify(selections));
        for(i = 0; i < selections['RECTANGLE'].length; i++ ){
            selectionClone['RECTANGLE'][i].coordinate.x = selections['RECTANGLE'][i].coordinate.x * x_scale;
            selectionClone['RECTANGLE'][i].coordinate.y = selections['RECTANGLE'][i].coordinate.y * y_scale;
            selectionClone['RECTANGLE'][i].height = selections['RECTANGLE'][i].height * y_scale;
            selectionClone['RECTANGLE'][i].width = selections['RECTANGLE'][i].width * x_scale;
        }

        //This method checks for whether the selections made by the user are close enough to the actual answer
        //First, check if the length is the same i.e., all objects were marked or not
        if (imageDetails.IMAGE_DETAILS.EDGES.length == selections['RECTANGLE'].length) {
            var leeway = environment.training_error;
            for (i = 0; i < selectionClone['RECTANGLE'].length; i++) {
                for (j = 0; j < imageDetails.IMAGE_DETAILS.EDGES.length; j++) {
                    //Edge case where START_X is 0
                    if((imageDetails.IMAGE_DETAILS.EDGES[j].START_X == 0 && Math.abs(imageDetails.IMAGE_DETAILS.EDGES[j].START_X - selectionClone['RECTANGLE'][i].coordinate.x) <= canvasWidth / 10)){
                        if(Math.abs((imageDetails.IMAGE_DETAILS.EDGES[j].HEIGHT - selectionClone['RECTANGLE'][i].height) / imageDetails.IMAGE_DETAILS.EDGES[j].HEIGHT) < leeway
                        && Math.abs((imageDetails.IMAGE_DETAILS.EDGES[j].START_Y - selectionClone['RECTANGLE'][i].coordinate.y) / imageDetails.IMAGE_DETAILS.EDGES[j].START_Y) < leeway
                        && Math.abs((imageDetails.IMAGE_DETAILS.EDGES[j].WIDTH - selectionClone['RECTANGLE'][i].width) / imageDetails.IMAGE_DETAILS.EDGES[j].WIDTH) < leeway){
                            imageDetails.IMAGE_DETAILS.EDGES.splice(j, 1);
                            var k = j + i + 1;
                            break;
                        }
                    }

                    //Edge case where START_Y is 0
                    if((imageDetails.IMAGE_DETAILS.EDGES[j].START_Y == 0 && Math.abs(imageDetails.IMAGE_DETAILS.EDGES[j].START_Y - selectionClone['RECTANGLE'][i].coordinate.y) <= canvasHeight / 10)){
                        if(Math.abs((imageDetails.IMAGE_DETAILS.EDGES[j].HEIGHT - selectionClone['RECTANGLE'][i].height) / imageDetails.IMAGE_DETAILS.EDGES[j].HEIGHT) < leeway
                        && Math.abs((imageDetails.IMAGE_DETAILS.EDGES[j].START_X - selectionClone['RECTANGLE'][i].coordinate.x) / imageDetails.IMAGE_DETAILS.EDGES[j].START_X) < leeway
                        && Math.abs((imageDetails.IMAGE_DETAILS.EDGES[j].WIDTH - selectionClone['RECTANGLE'][i].width) / imageDetails.IMAGE_DETAILS.EDGES[j].WIDTH) < leeway){
                            imageDetails.IMAGE_DETAILS.EDGES.splice(j, 1);
                            var k = j + i + 1;
                            break;
                        }
                    }
                    //Edge case where START_Y and START_X is 0
                    if(imageDetails.IMAGE_DETAILS.EDGES[j].START_Y == 0 && imageDetails.IMAGE_DETAILS.EDGES[j].START_X == 0
                        && (Math.abs(imageDetails.IMAGE_DETAILS.EDGES[j].START_Y - selectionClone['RECTANGLE'][i].coordinate.y) <= canvasHeight / 10 )
                        && (Math.abs(imageDetails.IMAGE_DETAILS.EDGES[j].START_X - selectionClone['RECTANGLE'][i].coordinate.x) <= canvasWidth / 10 ) ){
                        if(Math.abs((imageDetails.IMAGE_DETAILS.EDGES[j].HEIGHT - selectionClone['RECTANGLE'][i].height) / imageDetails.IMAGE_DETAILS.EDGES[j].HEIGHT) < leeway
                        && Math.abs((imageDetails.IMAGE_DETAILS.EDGES[j].WIDTH - selectionClone['RECTANGLE'][i].width) / imageDetails.IMAGE_DETAILS.EDGES[j].WIDTH) < leeway){
                            imageDetails.IMAGE_DETAILS.EDGES.splice(j, 1);
                            var k = j + i + 1;
                            break;
                        }
                    }
                    //Checks the START_X, START_Y, WIDTH and HEIGHT are within limits
                    else if (Math.abs((imageDetails.IMAGE_DETAILS.EDGES[j].START_X - selectionClone['RECTANGLE'][i].coordinate.x) / imageDetails.IMAGE_DETAILS.EDGES[j].START_X) < leeway
                        && Math.abs((imageDetails.IMAGE_DETAILS.EDGES[j].START_Y - selectionClone['RECTANGLE'][i].coordinate.y) / imageDetails.IMAGE_DETAILS.EDGES[j].START_Y) < leeway
                        && Math.abs((imageDetails.IMAGE_DETAILS.EDGES[j].HEIGHT - selectionClone['RECTANGLE'][i].height) / imageDetails.IMAGE_DETAILS.EDGES[j].HEIGHT) < leeway
                        && Math.abs((imageDetails.IMAGE_DETAILS.EDGES[j].WIDTH - selectionClone['RECTANGLE'][i].width) / imageDetails.IMAGE_DETAILS.EDGES[j].WIDTH) < leeway) {
                        imageDetails.IMAGE_DETAILS.EDGES.splice(j, 1);
                        var k = j + i + 1;
                        break;
                    }
                }
            }
            if (imageDetails.IMAGE_DETAILS.EDGES.length == 0 && i == selectionClone['RECTANGLE'].length) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

}