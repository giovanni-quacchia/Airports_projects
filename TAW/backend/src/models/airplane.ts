import mongoose = require('mongoose');
import Route from './route';
import { validateObj, validatePartialObj, isObject, isObjSameSize } from '../utils/utils';

// Interface
export interface Airplane{
    code: number,
    model: string,
    route?: mongoose.Schema.Types.ObjectId,
    airline: mongoose.Schema.Types.ObjectId,
    rows: number,
    letters: number
}

// Schema
const AirplaneSchema = new mongoose.Schema<Airplane>({
    code: {
        type: Number, 
        unique: true,
        validate: {
            validator: (code) => Number.isInteger(code) && code > 0,
            message: (props) => `${props.value} is not a valid positive integer`
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

    if(!isObject(data)) throw Error("Not valid data");

    let query: any = validateObj({
        code: [data.code, "number"],
        model: [data.model, "string"],
        rows: [data.rows, "number"],
        letters: [data.letters, "number"],
        airline: [data.airline, "IATA-2"],
    });

    if(data.route){
        query = {...query, route: Route.validateNew(data.route)};
    }

    if(!isObjSameSize(query, data)) throw Error("A new airplane must include: code, model, rows, letter, airline and optional route")

    return query;
}

export function validateUpdate(data: any): boolean{

    if(typeof data !== "object" || data === null || Array.isArray(data)) throw Error("Not valid data");

    const keys = Object.keys(data)

    if(
        (!data.code || isNaN(Number(data.code))) &&
        (!data.route || typeof data.route !== 'string') &&
        (!data.model || typeof data.model !== 'string') &&
        (!data.rows || isNaN(Number(data.rows))) &&
        (!data.airline || typeof data.airline !== 'string') &&
        (!data.letters || isNaN(Number(data.letters))) &&
        (!data.airline || !mongoose.Types.ObjectId.isValid(data.airline))
    )
        throw Error("Updating an airplane requires a new code, model, route or airline")

    if(data.code) data.code = Number(data.code);
    if(data.rows) data.rows = Number(data.rows);
    if(data.letters) data.letters = Number(data.letters);

    // Check if there are not valid keys
    const validKeys = ["code", "route", "model", "rows", "airline", "letters", "airline"];
    keys.forEach(key => {
        if(!validKeys.includes(key))
            throw Error("Not valid data");
        })
    return true;
}