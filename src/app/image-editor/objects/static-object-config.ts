import {IObjectOptions} from 'fabric/fabric-impl';

export const staticObjectConfig: IObjectOptions = {
    selectable: false,
    evented: false,
    lockMovementX: false,
    lockMovementY: false,
    lockRotation: false,
    lockScalingX: false,
    lockScalingY: false,
    lockUniScaling: true,
    hasControls: false,
    hasBorders: false,
    hasRotatingPoint: false,
    strokeWidth: 0,
};
