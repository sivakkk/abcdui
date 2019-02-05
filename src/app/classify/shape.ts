import { Coordinate } from './coordindate';

export interface Shape {
    drawStarted: boolean;

    fill(context, fillColor?, scale?: number);

    draw(context, scale: number, index: number, type: string, color: string);

    isInside(scale: number, x: number, y: number);

    scaleCoordinates(zoomMultiplier: number, zoomLevel: number, totalMoveX: number, totalMoveY: number);

    zoom(type: string, zoomMultiplier: number, totalMoveX: number, totalMoveY: number);

    toPercentage(canvasWidth: number, canvasHeight: number);

    fromPercentage(canvasWidth: number, canvasHeight: number);

    toJsonString();

    moveCoordinates(multiplier: number, x: number, y: number);

    findClosestCoordinate(scale: number, mouseX: number, mouseY: number);

    resizeShape(zoomMultiplier: number, zoomLevel: number, mouseX: number, mouseY: number, prevMouseX: number, prevMouseY: number, closestCoordinate: number);
}
