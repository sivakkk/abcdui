import { Coordinate } from './coordindate';
import { Shape } from './shape';
import { environment } from '../../environments/environment';

declare var $: any;

export class Cuboid {
    public drawStarted1: boolean;
    public drawStarted2: boolean;
    public isDown: boolean;
    private rectangle1: any;
    private rectangle2: any;

    private cloneRect1: any;
    private cloneRect2: any;

    static cursors = ['nw-resize', 'n-resize', 'ne-resize', 'e-resize', 'se-resize', 's-resize', 'sw-resize', 'w-resize'];

    constructor() {
        this.isDown = false;
        this.rectangle1 = {
            x: '',
            y: '',
            width: '',
            height: '',
            zoomed: {
                x: "",
                y: "",
                width: "",
                height: ""
            }
        }
        this.rectangle2 = {
            x: '',
            y: '',
            width: '',
            height: '',
            zoomed: {
                x: "",
                y: "",
                width: "",
                height: ""
            }
        }
        this.cloneRect1 = {
            x: '',
            y: '',
            width: '',
            height: '',
            zoomed: {
                x: "",
                y: "",
                width: "",
                height: ""
            }
        }
        this.cloneRect2 = {
            x: '',
            y: '',
            width: '',
            height: '',
            zoomed: {
                x: "",
                y: "",
                width: "",
                height: ""
            }
        }
    }

    setStartPoint(startX: number, startY: number) {
        if (!this.drawStarted1) {
            this.drawStarted1 = true;
            this.rectangle1.x = startX;
            this.rectangle1.y = startY;
            this.rectangle1.zoomed.x = startX;
            this.rectangle1.zoomed.y = startY;
        } else {
            this.drawStarted2 = true;
            this.rectangle2.x = startX;
            this.rectangle2.y = startY;
            this.rectangle2.zoomed.x = startX;
            this.rectangle2.zoomed.y = startY;
        }
    }

    setWidthHeight(width: number, height: number) {
        if (this.drawStarted2) {
            this.rectangle2.width = width;
            this.rectangle2.height = height;
            this.rectangle2.zoomed.width = width;
            this.rectangle2.zoomed.height = height;
        } else {
            this.rectangle1.width = width;
            this.rectangle1.height = height;
            this.rectangle1.zoomed.width = width;
            this.rectangle1.zoomed.height = height;
        }
    }

    getStart1() {
        var xy1 = {
            x: this.rectangle1.x,
            y: this.rectangle1.y
        }
        return xy1;
    }

    getStart2() {
        var xy2 = {
            x: this.rectangle2.x,
            y: this.rectangle2.y
        }
        return xy2;
    }

    drawRect(context, color) {
        context.strokeStyle = color || '#FF0000';
        if (!this.drawStarted2) {
            context.strokeRect(this.rectangle1.x, this.rectangle1.y, this.rectangle1.width, this.rectangle1.height);
        } else {
            context.strokeRect(this.rectangle2.x, this.rectangle2.y, this.rectangle2.width, this.rectangle2.height);
        }
    }

    fill(context, fillColor?) {
        context.globalAlpha = 0.2;
        context.fillStyle = fillColor || '#FBFF00';
        if (!this.drawStarted2 && this.isDown) {
            context.fillRect(this.rectangle1.x, this.rectangle1.y, this.rectangle1.width, this.rectangle1.height);
        } else {
            context.fillRect(this.rectangle2.x, this.rectangle2.y, this.rectangle2.width, this.rectangle2.height);
        }
        context.globalAlpha = 1;
    }

    fill2(context) {
        context.globalAlpha = 0.2;
        context.fillStyle = '#FBFF00';

        context.globalAlpha = 1;
    }

    zoom(type: string, zoomMultiplier: number, totalMoveX: number, totalMoveY: number) {
        let power = type == 'plus' ? 1 : -1;
        let multiplier = Math.pow(zoomMultiplier, power);

        this.rectangle1.zoomed.x -= totalMoveX;
        this.rectangle1.zoomed.y -= totalMoveY;
        this.rectangle2.zoomed.y -= totalMoveY;
        this.rectangle2.zoomed.x -= totalMoveX;

        this.rectangle1.zoomed.x = this.rectangle1.zoomed.x * multiplier;
        this.rectangle1.zoomed.y = this.rectangle1.zoomed.y * multiplier;

        this.rectangle2.zoomed.x = this.rectangle2.zoomed.x * multiplier;
        this.rectangle2.zoomed.y = this.rectangle2.zoomed.y * multiplier;

        this.rectangle1.zoomed.width = this.rectangle1.zoomed.width * multiplier;
        this.rectangle2.zoomed.width = this.rectangle2.zoomed.width * multiplier;

        this.rectangle1.zoomed.height = this.rectangle1.zoomed.height * multiplier;
        this.rectangle2.zoomed.height = this.rectangle2.zoomed.height * multiplier;
    }

    moveCoordinates(multiplier: number, x: number, y: number) {
        this.rectangle1.zoomed.x += (x * multiplier);
        this.rectangle1.zoomed.y += (y * multiplier);
        this.rectangle2.zoomed.x += (x * multiplier);
        this.rectangle2.zoomed.y += (y * multiplier);
    }

    isInside(scale: number, x: number, y: number) {
        let coordinate, width, height;
        var coordinates1, coordinates2;
        if (scale == 1) {
            coordinates1 = this.rectangle1;
            coordinates2 = this.rectangle2;
        }

        else {
            coordinates1 = this.rectangle1.zoomed;
            coordinates2 = this.rectangle2.zoomed;
        }

        let xf1 = coordinates1.x <= x;
        let xf2 = x <= (coordinates1.x + coordinates1.width);
        let yf1 = coordinates1.y <= y;
        let yf2 = y <= (coordinates1.y + coordinates1.height);

        let xr1 = coordinates2.x <= x;
        let xr2 = x <= (coordinates2.x + coordinates2.width);
        let yr1 = coordinates2.y <= y;
        let yr2 = y <= (coordinates2.y + coordinates2.height);

        return ((xf1 && xf2 && yf1 && yf2) || (xr1 && xr2 && yr1 && yr2));
    }

    toPercentage(canvasWidth: number, canvasHeight: number) {
        this.cloneRect1.x = this.rectangle1.x / canvasWidth * 100;
        this.cloneRect2.x = this.rectangle2.x / canvasWidth * 100;
        this.cloneRect1.y = this.rectangle1.y / canvasHeight * 100;
        this.cloneRect2.y = this.rectangle2.y / canvasHeight * 100;
        this.cloneRect1.width = this.rectangle1.width / canvasWidth * 100;
        this.cloneRect2.width = this.rectangle2.width / canvasWidth * 100;
        this.cloneRect1.height = this.rectangle1.height / canvasHeight * 100;
        this.cloneRect2.height = this.rectangle2.height / canvasHeight * 100;
    }

    fromPercentage(canvasWidth: number, canvasHeight: number) {
        this.rectangle1.x = this.rectangle1.x * canvasWidth / 100;
        this.rectangle1.y = this.rectangle1.y * canvasHeight / 100;
        this.rectangle1.width = this.rectangle1.width * canvasWidth / 100;
        this.rectangle1.height = this.rectangle1.height * canvasHeight / 100;

        this.rectangle1.zoomed.x = this.rectangle1.x;
        this.rectangle1.zoomed.y = this.rectangle1.y;
        this.rectangle1.zoomed.width = this.rectangle1.width;
        this.rectangle1.zoomed.height = this.rectangle1.height;


        this.rectangle2.x = this.rectangle2.x * canvasWidth / 100;
        this.rectangle2.y = this.rectangle2.y * canvasHeight / 100;
        this.rectangle2.width = this.rectangle2.width * canvasWidth / 100;
        this.rectangle2.height = this.rectangle2.height * canvasHeight / 100;

        this.rectangle2.zoomed.x = this.rectangle2.x;
        this.rectangle2.zoomed.y = this.rectangle2.y;
        this.rectangle2.zoomed.width = this.rectangle2.width;
        this.rectangle2.zoomed.height = this.rectangle2.height;
    }

    toJsonString() {
        return JSON.stringify({
            rect1: {
                x: this.cloneRect1.x,
                y: this.cloneRect1.y,
                width: this.cloneRect1.width,
                height: this.cloneRect1.height
            },
            rect2: {
                x: this.cloneRect2.x,
                y: this.cloneRect2.y,
                width: this.cloneRect2.width,
                height: this.cloneRect2.height
            }
        });
    }

    findClosestCoordinate(scale: number, mouseX: number, mouseY: number) {
        mouseX = mouseX / scale;
        mouseY = mouseY / scale;

        var distances = [
            this.getCartiseanDistance(this.rectangle1.x, this.rectangle1.y, mouseX, mouseY),
            this.getCartiseanDistance(this.rectangle1.x + (this.rectangle1.width / 2), this.rectangle1.y, mouseX, mouseY),
            this.getCartiseanDistance(this.rectangle1.x + this.rectangle1.width, this.rectangle1.y, mouseX, mouseY),
            this.getCartiseanDistance(this.rectangle1.x + this.rectangle1.width, this.rectangle1.y + (this.rectangle1.height / 2), mouseX, mouseY),
            this.getCartiseanDistance(this.rectangle1.x + this.rectangle1.width, this.rectangle1.y + this.rectangle1.height, mouseX, mouseY),
            this.getCartiseanDistance(this.rectangle1.x + (this.rectangle1.width / 2), this.rectangle1.y + this.rectangle1.height, mouseX, mouseY),
            this.getCartiseanDistance(this.rectangle1.x, this.rectangle1.y + this.rectangle1.height, mouseX, mouseY),
            this.getCartiseanDistance(this.rectangle1.x, this.rectangle1.y + (this.rectangle1.height / 2), mouseX, mouseY),

            this.getCartiseanDistance(this.rectangle2.x, this.rectangle2.y, mouseX, mouseY),
            this.getCartiseanDistance(this.rectangle2.x + (this.rectangle2.width / 2), this.rectangle2.y, mouseX, mouseY),
            this.getCartiseanDistance(this.rectangle2.x + this.rectangle2.width, this.rectangle2.y, mouseX, mouseY),
            this.getCartiseanDistance(this.rectangle2.x + this.rectangle2.width, this.rectangle2.y + (this.rectangle2.height / 2), mouseX, mouseY),
            this.getCartiseanDistance(this.rectangle2.x + this.rectangle2.width, this.rectangle2.y + this.rectangle2.height, mouseX, mouseY),
            this.getCartiseanDistance(this.rectangle2.x + (this.rectangle2.width / 2), this.rectangle2.y + this.rectangle2.height, mouseX, mouseY),
            this.getCartiseanDistance(this.rectangle2.x, this.rectangle2.y + this.rectangle2.height, mouseX, mouseY),
            this.getCartiseanDistance(this.rectangle2.x, this.rectangle2.y + (this.rectangle2.height / 2), mouseX, mouseY)
        ];

        var indexOfMinValue = distances.reduce((iMin, x, i, arr) => x < arr[iMin] ? i : iMin, 0);

        $('app-classify').css('cursor', Cuboid.cursors[indexOfMinValue % Cuboid.cursors.length]);

        return indexOfMinValue;
    }

    getCartiseanDistance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
    }

    resizeShape(zoomMultiplier: number, zoomLevel: number, mouseX: number, mouseY: number, prevMouseX: number, prevMouseY: number, closestCoordinate: number) {
        let rectangleKey = closestCoordinate > 7 ? 'rectangle2' : 'rectangle1';
        let zoomFactor = Math.pow(zoomMultiplier, -zoomLevel);
        closestCoordinate = closestCoordinate > 7 ? closestCoordinate - 8 : closestCoordinate;

        //resizing from rectangle-2 top edge
        if (closestCoordinate == 0 || closestCoordinate == 1 || closestCoordinate == 2) {
            if (prevMouseY) {
                this[rectangleKey].height += ((prevMouseY - mouseY) * zoomFactor);
                this[rectangleKey].zoomed.height += (prevMouseY - mouseY);

                this[rectangleKey].y -= ((prevMouseY - mouseY) * zoomFactor);
                this[rectangleKey].zoomed.y -= (prevMouseY - mouseY);
            }
        }

        //resizing from rectangle-2 right edge
        if (closestCoordinate == 2 || closestCoordinate == 3 || closestCoordinate == 4) {
            if (prevMouseX) {
                this[rectangleKey].width += ((mouseX - prevMouseX) * zoomFactor);
                this[rectangleKey].zoomed.width += (mouseX - prevMouseX);
            }
        }

        //resizing from rectangle-2 bottom edge
        if (closestCoordinate == 4 || closestCoordinate == 5 || closestCoordinate == 6) {
            if (prevMouseY) {
                this[rectangleKey].height += ((mouseY - prevMouseY) * zoomFactor);
                this[rectangleKey].zoomed.height += mouseY - prevMouseY;
            }
        }

        //resizing from rectangle-2 left edge
        if (closestCoordinate == 6 || closestCoordinate == 7 || closestCoordinate == 0) {
            if (prevMouseX) {
                this[rectangleKey].width += ((prevMouseX - mouseX) * zoomFactor);
                this[rectangleKey].zoomed.width += (prevMouseX - mouseX);

                // x coordinate will change when we are re-sizing from left side
                this[rectangleKey].x -= (prevMouseX - mouseX) * zoomFactor;
                this[rectangleKey].zoomed.x -= (prevMouseX - mouseX);
            }
        }
    }

    draw(context, scale, index, type = 'NORMAL', color) {
        var clone1 = JSON.parse(JSON.stringify(this.rectangle1));
        var clone2 = JSON.parse(JSON.stringify(this.rectangle2));
        context.strokeStyle = color || environment.CANVAS_SHAPE[type].STROKE_COLOR;
        context.fillStyle = environment.CANVAS_DOT[type].FILL_COLOR;
        context.lineWidth = environment.CANVAS_SHAPE[type].LINE_WIDTH;
        let arcWidth = environment.CANVAS_DOT[type].SIZE;

        let coordinate, width, height;

        var draw1, draw2;
        // console.log(scale, this.rectangle1, this.rectangle2)
        // if (scale == 1) {
        //     draw1 = this.rectangle1;
        //     draw2 = this.rectangle2;
        // }

        // else {
        draw1 = this.rectangle1.zoomed;
        draw2 = this.rectangle2.zoomed;
        // }

        context.strokeRect(draw1.x, draw1.y, draw1.width, draw1.height);
        context.strokeRect(draw2.x, draw2.y, draw2.width, draw2.height);
        context.beginPath();

        context.moveTo(draw1.x, draw1.y);
        context.lineTo(draw2.x, draw2.y);

        context.moveTo(draw1.x + draw1.width, draw1.y);
        context.lineTo(draw2.x + draw2.width, draw2.y);

        context.moveTo(draw1.x + draw1.width, draw1.y + draw1.height);
        context.lineTo(draw2.x + draw2.width, draw2.y + draw2.height);

        context.moveTo(draw1.x, draw1.y + draw1.height);
        context.lineTo(draw2.x, draw2.y + draw2.height);
        context.stroke();

        var vertices = [
            [draw1.x, draw1.y],
            [draw1.x + (draw1.width / 2), draw1.y],
            [draw1.x + draw1.width, draw1.y],
            [draw1.x + draw1.width, draw1.y + (draw1.height / 2)],
            [draw1.x + draw1.width, draw1.y + draw1.height],
            [draw1.x + (draw1.width / 2), draw1.y + draw1.height],
            [draw1.x, draw1.y + (draw1.height / 2)],
            [draw1.x, draw1.y + draw1.height],

            [draw2.x, draw2.y],
            [draw2.x + (draw2.width / 2), draw2.y],
            [draw2.x + draw2.width, draw2.y],
            [draw2.x + draw2.width, draw2.y + (draw2.height / 2)],
            [draw2.x + draw2.width, draw2.y + draw2.height],
            [draw2.x + (draw2.width / 2), draw2.y + draw2.height],
            [draw2.x, draw2.y + (draw2.height / 2)],
            [draw2.x, draw2.y + draw2.height]
        ];

        vertices.forEach(vertex => {
            context.beginPath();
            context.arc(vertex[0], vertex[1], arcWidth, 0, 2 * Math.PI);
            context.fill();
        });

        context.font = environment.CANVAS_TEXT[type].FONT;
        context.fillStyle = environment.CANVAS_TEXT[type].COLOR;
        context.fillText('Cu' + (index + 1), draw1.x + (draw1.width / 2) - 5, draw1.y - 5);
    }
}
