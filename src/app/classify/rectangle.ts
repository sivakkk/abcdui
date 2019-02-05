import { Shape } from './shape';
import { Coordinate } from './coordindate';
import { environment } from '../../environments/environment';

declare var $: any;

export class Rectangle implements Shape {
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

    static cursors = [ 'n-resize', 'e-resize', 's-resize', 'w-resize', 'nw-resize', 'ne-resize', 'sw-resize', 'se-resize' ];

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

    setWidthHeight(width: number, height: number) {
        this.width = width;
        this.height = height;
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
        const arcWidth = environment.CANVAS_DOT[type].SIZE;

        let coordinate, width, height;

        if (scale === 1) {
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

        const dotCoordindates = [
            [coordinate.x, coordinate.y],
            [coordinate.x + width, coordinate.y],
            [coordinate.x + width, coordinate.y + height],
            [coordinate.x, coordinate.y + height],
            [coordinate.x + (width / 2), coordinate.y],
            [coordinate.x + width, coordinate.y + (height / 2)],
            [coordinate.x + (width / 2), coordinate.y + height],
            [coordinate.x, coordinate.y + (height / 2)]
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

        if (scale === 1) {
            coordinate = this.coordinate;
            width = this.width;
            height = this.height;
        }

        else {
            coordinate = this.zoomedCoordinate;
            width = this.zoomedWidth;
            height = this.zoomedHeight;
        }

        const a = coordinate.x <= x;
        const b = x <= (coordinate.x + width);
        const c = coordinate.y <= y;
        const d = y <= (coordinate.y + height);

        return a && b && c && d;
    }

    scaleCoordinates(zoomMultiplier: number, zoomLevel: number, totalMoveX: number, totalMoveY: number) {
        let zoomFactor = Math.pow(zoomMultiplier, -zoomLevel);

        this.coordinate = new Coordinate(zoomFactor * (this.zoomedCoordinate.x - totalMoveX), zoomFactor * (this.zoomedCoordinate.y - totalMoveY));
        this.width = zoomFactor * this.zoomedWidth;
        this.height = zoomFactor * this.zoomedHeight;
    }

    zoom(type: string, scale: number, totalMoveX: number, totalMoveY: number) {
        const power = type === 'plus' ? 1 : -1;
        const multiplier = Math.pow(scale, power);

        this.zoomedCoordinate.x -= totalMoveX;
        this.zoomedCoordinate.y -= totalMoveY;

        this.zoomedCoordinate.x = this.zoomedCoordinate.x * multiplier;
        this.zoomedCoordinate.y = this.zoomedCoordinate.y * multiplier;
        this.zoomedWidth = this.zoomedWidth * multiplier;
        this.zoomedHeight = this.zoomedHeight * multiplier;

        console.log('coordinate', this.coordinate, this.width, this.height);
        console.log('zoomedCoordinate', this.zoomedCoordinate, this.zoomedWidth, this.zoomedHeight);
        console.log('\n');
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

    findClosestCoordinate(scale: number, mouseX: number, mouseY: number) {
        let coordinate = scale == 1 ? this.coordinate : this.zoomedCoordinate;
        let width = scale == 1 ? this.width : this.zoomedWidth;
        let height = scale == 1 ? this.height : this.zoomedHeight;

        const distances = [
            this.getCartiseanDistance(coordinate.x + (width / 2), coordinate.y, mouseX, mouseY), //distance from top edge
            this.getCartiseanDistance(coordinate.x + width, coordinate.y + (height / 2), mouseX, mouseY), //distance from right edge
            this.getCartiseanDistance(coordinate.x + (width / 2), coordinate.y + height, mouseX, mouseY), //distance from bottom edge
            this.getCartiseanDistance(coordinate.x, coordinate.y + (height / 2), mouseX, mouseY), //distance from left edge
            this.getCartiseanDistance(coordinate.x, coordinate.y, mouseX, mouseY), //distance from top left coordinate
            this.getCartiseanDistance(coordinate.x + width, coordinate.y, mouseX, mouseY), //distance from top right coordinate
            this.getCartiseanDistance(coordinate.x, coordinate.y + height, mouseX, mouseY), //distance from bottom left coordinate
            this.getCartiseanDistance(coordinate.x + width, coordinate.y + height, mouseX, mouseY) //distance from bottom right coordinate
        ];

        const indexOfMinValue = distances.reduce((iMin, x, i, arr) => x < arr[iMin] ? i : iMin, 0);

        $('app-classify').css('cursor', Rectangle.cursors[indexOfMinValue]);

        return indexOfMinValue;
    }

    getCartiseanDistance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
    }

    resizeShape(zoomMultiplier: number, zoomLevel: number, mouseX: number, mouseY: number, prevMouseX: number, prevMouseY: number, closestCoordinate: number) {
        let zoomFactor = Math.pow(zoomMultiplier, -zoomLevel);

        if (closestCoordinate == 0 || closestCoordinate == 4 || closestCoordinate == 5) {
            // resizing from top edge ==>> need to add the height to the previous height
            if (prevMouseY) {
                this.height += ((prevMouseY - mouseY) * zoomFactor);
                this.zoomedHeight += (prevMouseY - mouseY);

                // y coordinate will change when we are re-sizing from right side
                this.coordinate.y -= ((prevMouseY - mouseY) * zoomFactor);
                this.zoomedCoordinate.y -= (prevMouseY - mouseY);
            }
        }

        if (closestCoordinate == 1 || closestCoordinate == 5 || closestCoordinate == 7) {
            // resizing from right edge
            if (prevMouseX) {
                this.width += ((mouseX - prevMouseX) * zoomFactor);
                this.zoomedWidth += (mouseX - prevMouseX);
            }
        }

        if (closestCoordinate == 2 || closestCoordinate == 6 || closestCoordinate == 7) {
            // resizing from bottom edge
            if (prevMouseY) {
                this.height = this.height + ((mouseY - prevMouseY) * zoomFactor);
                this.zoomedHeight = this.zoomedHeight + mouseY - prevMouseY;
            }
        }

        if (closestCoordinate == 3 || closestCoordinate == 4 || closestCoordinate == 6) {
            // resizing from left edge
            if (prevMouseX) {
                this.width += ((prevMouseX - mouseX) * zoomFactor);
                this.zoomedWidth += (prevMouseX - mouseX);

                // x coordinate will change when we are re-sizing from left side
                this.coordinate.x -= (prevMouseX - mouseX) * zoomFactor;
                this.zoomedCoordinate.x -= (prevMouseX - mouseX);
            }
        }

        prevMouseX = mouseX;
        prevMouseY = mouseY;
    }

    getFloatValue(exp, precision = 3) {
        return parseFloat(exp.toFixed(precision));
    }
}
