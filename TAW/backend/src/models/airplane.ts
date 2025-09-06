import mongoose = require('mongoose');
import { Route } from './route';

// Interface
export interface Airplane{
    code: number,
    model: string,
    route?: mongoose.Schema.Types.ObjectId,
    airline?: mongoose.Schema.Types.ObjectId,
    rows: number,
    letters: number
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
    route: {type: mongoose.Schema.ObjectId, ref: 'Route'},
    airline: {type: mongoose.Schema.ObjectId, ref: 'Airline'},
    rows: {type: Number, required: true},
    letters: {type: Number, required: true},
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

    if(!data.code || isNaN(Number(data.code))) 
        throw Error("Code required");
    if(!data.model || typeof data.model !== 'string') 
        throw Error("Model required");
    if(data.route || typeof data?.route !== 'string')
        throw Error("Route not valid")
    if(data.rows || isNaN(Number(data.rows)))
        throw Error("Number of rows not valid")
    if(data.letters || isNaN(Number(data.letters)))
        throw Error("Number of letters not valid")

    data.code = Number(data.code);
    data.rows = Number(data.rows);
    data.letters = Number(data.letters)

    // Check if there are not valid keys
    const validKeys = ["code", "model", "route", "rows", "letters"];
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
        (!data.code || isNaN(Number(data.code))) &&
        (!data.route || typeof data.route !== 'string') &&
        (!data.model || typeof data.model !== 'string') &&
        (!data.rows || isNaN(Number(data.rows))) &&
        (!data.letters || isNaN(Number(data.letters)))  
    )
        throw Error("Updating an airplane requires a new code, model or route")

    if(data.code) data.code = Number(data.code);
    if(data.rows) data.rows = Number(data.rows);
    if(data.letters) data.letters = Number(data.letters);

    // Check if there are not valid keys
    const validKeys = ["code", "route", "model", "rows", "letters"];
    keys.forEach(key => {
        if(!validKeys.includes(key))
            throw Error("Not valid data");
        })
    return true;
}