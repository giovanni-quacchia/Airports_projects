import mongoose = require('mongoose');
import { Route } from './Route';

// Interface
export interface Airplane{
    code: number,
    model: string,
    route?: Route
    // Current Airline
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
    model: {type: String, required: true},
    route: {type: mongoose.Schema.ObjectId, ref: 'Route'}
});

// Model

let airplaneModel: mongoose.Model<Airplane>;
export function getModel(): mongoose.Model<Airplane> {
    if(!airplaneModel) airplaneModel = mongoose.model<Airplane>('Airplane', AirplaneSchema);
    return airplaneModel;
}

export function newAirplane(data): mongoose.HydratedDocument<Airplane> {
    validateInput(data);
    const _airplaneModel = getModel();
    const airplane = new _airplaneModel(data);
    return airplane;
}

// Validate

function validateInput(data: any): boolean{

    if(typeof data !== "object" || data === null || Array.isArray(data)) throw Error("Not valid data");

    const keys = Object.keys(data)

    if(!data.code || typeof data.code !== 'number') 
        throw Error("Code required");
    if(!data.model || typeof data.model !== 'string') 
        throw Error("Model required");
    if(data.route && typeof data?.route !== 'string')
        throw Error("Route not valid")
    // Check if there are not valid keys
    const validKeys = ["code", "model", "route"];
    keys.forEach(key => {
        if(!validKeys.includes(key))
            throw Error("Not valid data");
        })
    return true;
}

export function validateUpdate(data: any): boolean{

    if(typeof data !== "object" || data === null || Array.isArray(data)) throw Error("Not valid data");

    const keys = Object.keys(data)

    if(
        (!data.code || typeof data.code !== 'number') &&
        (!data.route || typeof data.route !== 'string')
    )
        throw Error("Updating an airplane requires a new code or route")
    // Check if there are not valid keys
    const validKeys = ["code", "route"];
    keys.forEach(key => {
        if(!validKeys.includes(key))
            throw Error("Not valid data");
        })
    return true;
}