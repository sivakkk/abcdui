import { Coordinate } from './coordindate';

export interface Shape {
    drawStarted: boolean;

    fill(context, scale?: number);

    draw(context, scale: number, index: number, type: string);

    isInside(scale: number, x: number, y: number);

    scaleCoordinates(zoomFactor: number);

    zoom(type: string, zoomMultiplier: number, totalMoveX: number, totalMoveY: number);

    toPercentage(canvasWidth: number, canvasHeight: number);

    fromPercentage(canvasWidth: number, canvasHeight: number);

    toJsonString();

    moveCoordinates(multiplier: number, x: number, y: number);
}
