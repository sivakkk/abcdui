import { Shape } from './shape';
import { Coordinate } from './coordindate';
import { environment } from '../../environments/environment';

declare var $: any;

export class Polygon implements Shape {
    drawStarted: boolean;
    coordinates: Array<Coordinate>;
    clonedCoordinates: Array<Coordinate>;
    zoomedCoordinates: Array<Coordinate>;
    tempCoordinate: Coordinate;

    static cursors = [ 'grab' ];

    constructor() {
        this.drawStarted = false;
        this.coordinates = new Array<Coordinate>();
        this.zoomedCoordinates = new Array<Coordinate>();
        this.tempCoordinate = new Coordinate(0, 0);
    }

    addCoordinate(x: number, y: number) {
        this.coordinates.push(new Coordinate(x, y));
        this.zoomedCoordinates.push(new Coordinate(x, y));
    }

    setTempCoordinate(x: number, y: number) {
        this.tempCoordinate = new Coordinate(x, y);
    }

    fill(context, fillColor?) {
        context.beginPath();
        context.moveTo(this.coordinates[0].x, this.coordinates[0].y);

        for (var i = 1; i < this.coordinates.length; i++)
            context.lineTo(this.coordinates[i].x, this.coordinates[i].y);

        context.lineTo(this.tempCoordinate.x, this.tempCoordinate.y);
        context.closePath();

        if (this.coordinates.length < 2)
            context.stroke();

        else {
            context.globalAlpha = 0.4;
            context.fillStyle = fillColor || '#FBFF00';
            context.fill();

            context.globalAlpha = 1;
        }
    }

    draw(context, scale: number, index: number, type = 'NORMAL', color) {
        context.strokeStyle = color || environment.CANVAS_SHAPE[type].STROKE_COLOR;
        context.fillStyle = environment.CANVAS_DOT[type].FILL_COLOR;
        context.lineWidth = environment.CANVAS_SHAPE[type].LINE_WIDTH;
        const arcWidth = environment.CANVAS_DOT[type].SIZE;

        // let coordinates = scale == 1 ? this.coordinates : this.zoomedCoordinates;
        const coordinates = this.zoomedCoordinates;

        context.beginPath();
        context.moveTo(coordinates[0].x, coordinates[0].y);

        coordinates.forEach((coordinate) => {
            context.lineTo(coordinate.x, coordinate.y);
        });

        context.closePath();
        context.stroke();

        coordinates.forEach((coordinate) => {
            context.beginPath();
            context.arc(coordinate.x, coordinate.y, arcWidth, 0, 2 * Math.PI);
            context.fill();
        });

        context.font = environment.CANVAS_TEXT[type].FONT;
        context.fillStyle = environment.CANVAS_TEXT[type].COLOR;
        context.fillText('P' + (index + 1), coordinates[0].x - 7, coordinates[0].y - 7);
    }

    isInside(scale: number, x: number, y: number) {
        const coordinates = scale === 1 ? this.coordinates : this.zoomedCoordinates;
        var inside = false;

        for (var i = 0, j = coordinates.length - 1; i < coordinates.length; j = i++) {
            var xi = coordinates[i].x, yi = coordinates[i].y;
            var xj = coordinates[j].x, yj = coordinates[j].y;

            var intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

            if (intersect)
                inside = !inside;
        }

        return inside;
    }

    scaleCoordinates(zoomMultiplier: number, zoomLevel: number, totalMoveX: number, totalMoveY: number) {
        let zoomFactor = Math.pow(zoomMultiplier, -zoomLevel);

        this.coordinates.forEach((coordinate, index) => {
            coordinate = new Coordinate(zoomFactor * (this.zoomedCoordinates[index].x - totalMoveX), zoomFactor * (this.zoomedCoordinates[index].y - totalMoveY));
        });
    }

    getFloatValue(exp: number, precision = 3) {
        return parseFloat(exp.toFixed(precision));
    }

    zoom(type: string, zoomMultiplier: number, totalMoveX: number, totalMoveY: number) {
        const power = type === 'plus' ? 1 : -1;
        const multiplier = Math.pow(zoomMultiplier, power);

        this.zoomedCoordinates.forEach((coordinate) => {
            coordinate.x -= totalMoveX;
            coordinate.y -= totalMoveY;

            coordinate.x = this.getFloatValue(coordinate.x * multiplier);
            coordinate.y = this.getFloatValue(coordinate.y * multiplier);
        });
    }

    toPercentage(canvasWidth: number, canvasHeight: number) {
        this.clonedCoordinates = new Array<Coordinate>();

        this.coordinates.forEach((element, index) => {
            const x = element.x / canvasWidth * 100;
            const y = element.y / canvasHeight * 100;

            this.clonedCoordinates.push(new Coordinate(x, y));
        });
    }

    fromPercentage(canvasWidth: number, canvasHeight: number) {
        this.coordinates.forEach((element) => {
            element.x = element.x * canvasWidth / 100;
            element.y = element.y * canvasHeight / 100;
        });

        this.zoomedCoordinates.forEach((element) => {
            element.x = element.x * canvasWidth / 100;
            element.y = element.y * canvasHeight / 100;
        });
    }

    toJsonString() {
        return JSON.stringify(this.clonedCoordinates);
    }

    moveCoordinates(multiplier: number, x: number, y: number) {
        this.zoomedCoordinates.forEach((coordinate) => {
            coordinate.x += (x * multiplier);
            coordinate.y += (y * multiplier);
        });
    }

    findClosestCoordinate(scale: number, mouseX: number, mouseY: number) {
        mouseX = mouseX / scale;
        mouseY = mouseY / scale;

        const distances = [];

        for(var i = 0; i < this.coordinates.length; i++)
            distances.push(Math.sqrt(Math.pow(this.coordinates[i].x - mouseX, 2) + Math.pow(this.coordinates[i].y - mouseY, 2)));

        const indexOfMinValue = distances.reduce((iMin, x, i, arr) => x < arr[iMin] ? i : iMin, 0);

        $('app-classify').css('cursor', Polygon.cursors[0]);

        return indexOfMinValue;
    }

    resizeShape(zoomMultiplier: number, zoomLevel: number, mouseX: number, mouseY: number, prevMouseX: number, prevMouseY: number, closestCoordinate: number) {
        let zoomFactor = Math.pow(zoomMultiplier, -zoomLevel);

        if (prevMouseX) {
            this.coordinates[closestCoordinate].x += ((mouseX - prevMouseX) * zoomFactor);
            this.zoomedCoordinates[closestCoordinate].x += (mouseX - prevMouseX);
        }

        if (prevMouseY) {
            this.coordinates[closestCoordinate].y += ((mouseY - prevMouseY) * zoomFactor);
            this.zoomedCoordinates[closestCoordinate].y += (mouseY - prevMouseY);
        }
    }
}
