import { Shape } from './shape';
import { Coordinate } from './coordindate';
import { environment } from '../../environments/environment';

export class Circle implements Shape {
    coordinate: Coordinate;
    radius: number;

    clonedRadius: number;
    clonedCoordinate: Coordinate;

    zoomedCoordinate: Coordinate;
    zoomedRadius: number;

    drawStarted: boolean;

    constructor() {
        this.drawStarted = false;
        this.clonedCoordinate = new Coordinate(0, 0);
    }

    setCentre(cx: number, cy: number) {
        this.coordinate = new Coordinate(cx, cy);
        this.zoomedCoordinate = new Coordinate(cx, cy);
    }

    setCircumferencePoint(x: number, y: number) {
        this.radius = Math.sqrt(Math.pow(x - this.coordinate.x, 2) + Math.pow(y - this.coordinate.y, 2));
        this.zoomedRadius = Math.sqrt(Math.pow(x - this.coordinate.x, 2) + Math.pow(y - this.coordinate.y, 2));
    }

    setRadius(r: number) {
        this.radius = r;
        this.zoomedRadius = r;
    }

    fill(context, fillColor?) {
        context.globalAlpha = 0.2;
        context.fillStyle = fillColor || '#FBFF00';

        context.beginPath();
        context.arc(this.coordinate.x, this.coordinate.y, this.radius, 0, 2 * Math.PI);
        context.fill();

        context.globalAlpha = 1;
    }

    draw(context, scale: number, index: number, type = 'NORMAL', color) {
        context.strokeStyle = color || environment.CANVAS_SHAPE[type].STROKE_COLOR;
        context.fillStyle = environment.CANVAS_DOT[type].FILL_COLOR;
        context.lineWidth = environment.CANVAS_SHAPE[type].LINE_WIDTH;
        let arcWidth = environment.CANVAS_DOT[type].SIZE;

        let coordinate, radius;

        if (scale == 1) {
            coordinate = this.coordinate;
            radius = this.radius;
        }

        else {
            coordinate = this.zoomedCoordinate;
            radius = this.zoomedRadius;
        }

        context.beginPath();
        context.arc(coordinate.x, coordinate.y, radius, 0, 2 * Math.PI);
        context.stroke();

        var dotCoordindates = [
            [coordinate.x, coordinate.y - radius],
            [coordinate.x, coordinate.y + radius],
            [coordinate.x + radius, coordinate.y],
            [coordinate.x - radius, coordinate.y]
        ];

        dotCoordindates.forEach(variable => {
            context.beginPath();
            context.arc(variable[0], variable[1], arcWidth, 0, 2 * Math.PI);
            context.fill();
        });

        context.font = environment.CANVAS_TEXT[type].FONT;
        context.fillStyle = environment.CANVAS_TEXT[type].COLOR;
        context.fillText('C' + (index + 1), coordinate.x, coordinate.y - radius - 7);
    }

    isInside(scale: number, x: number, y: number) {
        let coordinate, radius;

        if (scale == 1) {
            coordinate = this.coordinate;
            radius = this.radius;
        }

        else {
            coordinate = this.zoomedCoordinate;
            radius = this.zoomedRadius;
        }

        let distance = Math.sqrt(Math.pow(x - coordinate.x, 2) + Math.pow(y - coordinate.y, 2));

        return distance < radius;
    }

    scaleCoordinates(zoomMultiplier: number, zoomLevel: number, totalMoveX: number, totalMoveY: number) {
        let zoomFactor = Math.pow(zoomMultiplier, -zoomLevel);

        this.coordinate = new Coordinate(zoomFactor * (this.zoomedCoordinate.x - totalMoveX), zoomFactor * (this.zoomedCoordinate.y - totalMoveY));
        this.radius = this.radius * zoomFactor;
    }

    zoom(type: string, zoomMultiplier: number, totalMoveX: number, totalMoveY: number) {
        let power = type == 'plus' ? 1 : -1;
        let multiplier = Math.pow(zoomMultiplier, power);

        this.zoomedCoordinate.x -= totalMoveX;
        this.zoomedCoordinate.y -= totalMoveY;

        this.zoomedCoordinate.x = this.zoomedCoordinate.x * multiplier;
        this.zoomedCoordinate.y = this.zoomedCoordinate.y * multiplier;
        this.zoomedRadius = this.zoomedRadius * multiplier;
    }

    toPercentage(canvasWidth: number, canvasHeight: number) {
        this.clonedCoordinate.x = this.coordinate.x / canvasWidth * 100;
        this.clonedCoordinate.y = this.coordinate.y / canvasHeight * 100;
        this.clonedRadius = this.radius / canvasWidth * 100;
    }

    fromPercentage(canvasWidth: number, canvasHeight: number) {
        this.coordinate.x = this.coordinate.x * canvasWidth / 100;
        this.coordinate.y = this.coordinate.y * canvasHeight / 100;
        this.radius = this.radius * canvasWidth / 100;

        this.zoomedCoordinate.x = this.coordinate.x;
        this.zoomedCoordinate.y = this.coordinate.y;
        this.zoomedRadius = this.radius;
    }

    toJsonString() {
        return JSON.stringify({
            centreX: this.clonedCoordinate.x,
            centreY: this.clonedCoordinate.y,
            radius: this.clonedRadius,
        });
    }

    moveCoordinates(multiplier: number, x: number, y: number) {
        this.zoomedCoordinate.x += (x * multiplier);
        this.zoomedCoordinate.y += (y * multiplier);
    }

    findClosestCoordinate(scale: number, mouseX: number, mouseY: number){

    }

    resizeShape(scale: number, mouseX: number, mouseY: number, closestCoordinate: number) {

    }
}
