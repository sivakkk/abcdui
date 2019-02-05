import { Shape } from './shape';
import { Coordinate } from './coordindate';
import { environment } from '../../environments/environment';

export class Line implements Shape {
    public drawStarted: boolean;

    private coordinate: Coordinate;
    private width: number;
    private height: number;

    private clonedCoordinate: Coordinate;
    private clonedWidth: number;
    private clonedHeight: number;

    private zoomedCoordinate: Coordinate;
    private zoomedHeight: number;
    private zoomedWidth: number;

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

    fill(context, fillColor?) {
        context.globalAlpha = 0.2;
        context.fillStyle = fillColor || '#FBFF00';
        context.fillRect(this.coordinate.x, this.coordinate.y, this.width, this.height);
        context.globalAlpha = 1;
    }

    draw(context, scale: number, index: number, type = 'NORMAL', color) {
        context.strokeStyle = color || environment.CANVAS_SHAPE[type].STROKE_COLOR;
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

    scaleCoordinates(zoomMultiplier: number, zoomLevel: number, totalMoveX: number, totalMoveY: number) {
        let zoomFactor = Math.pow(zoomMultiplier, -zoomLevel);

        this.coordinate = new Coordinate(zoomFactor * (this.zoomedCoordinate.x - totalMoveX), zoomFactor * (this.zoomedCoordinate.y - totalMoveY));
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

    findClosestCoordinate(scale: number, mouseX: number, mouseY: number){

    }

    resizeShape(zoomMultiplier: number, zoomLevel: number, mouseX: number, mouseY: number, closestCoordinate: number) {

    }
}
