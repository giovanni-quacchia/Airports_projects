import mongoose = require('mongoose');
import { Route } from './route';

// Interface
export interface Airplane{
    code: number,
    route: Route
}

// Schema

const AirplaneSchema = new mongoose.Schema<Airplane>({
    code: {
        type: Number, 
        unique: true,
        validate: {
            validator: Number.isInteger
        }
    },
    route: {type: mongoose.Schema.ObjectId, ref: 'Route'}
});

// Model

let airplaneModel: mongoose.Model<Airplane>;
export function getModel(): mongoose.Model<Airplane> {
    if(!airplaneModel) airplaneModel = mongoose.model<Airplane>('Airplane', AirplaneSchema);
    return airplaneModel;
}

export function newAirplane(data): Airplane {
    const _airplaneModel = getModel();
    const airplane = new _airplaneModel(data);
    return airplane;
}