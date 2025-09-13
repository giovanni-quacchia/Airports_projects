import mongoose = require('mongoose');
import Route from './route';
import { validateObj, validatePartialObj, isObject, isObjSameSize } from '../utils/utils';

// Interface
export interface Airplane{
    code: number,
    model: string,
    airline: mongoose.Schema.Types.ObjectId,
    rows: number,
    letters: number
    route?: mongoose.Schema.Types.ObjectId,
}

// Schema
const AirplaneSchema = new mongoose.Schema<Airplane>({
    code: {
        type: Number, 
        unique: true,
        required: true,
        validate: {
            validator: (code) => Number.isInteger(code) && code > 0,
            message: (props) => `${props.value} is not a valid positive integer`
        }
    },
    model: {type: String, required: true},
    airline: {type: mongoose.Schema.ObjectId, ref: 'Airline', required: true},
    rows: {type: Number, required: true},
    letters: {type: Number, required: true},
    route: {type: mongoose.Schema.ObjectId, ref: 'Route'},
});

// Model

let airplaneModel: mongoose.Model<Airplane>;
export function getModel(): mongoose.Model<Airplane> {
    if(!airplaneModel) airplaneModel = mongoose.model<Airplane>('Airplane', AirplaneSchema);
    return airplaneModel;
}

export function newAirplane(data): mongoose.HydratedDocument<Airplane> {
    const _airplaneModel = getModel();
    const airplane = new _airplaneModel(data);
    return airplane;
}

// Validate

export function validateNew(data: any){

    if(!isObject(data)) throw Error("Object expected");

    let query: any = validateObj({
        code: [data.code, "number"],
        model: [data.model, "string"],
        rows: [data.rows, "number"],
        letters: [data.letters, "number"],
        airline: [data.airline, "ID"],
    });

    if(data.route){
        const route = validatePartialObj({
            route: [data.route, "ID"]
        })
        query = {...query, ...route};
    }

    if(!isObjSameSize(query, data)) throw Error("A new airplane must include: code, model, rows, letter, airline and optional route")

    return query;
}

export function validateUpdate(data: any){

    if(!isObject(data)) throw Error("Object expected");

    const parsedData = validatePartialObj({
        code: [data.code, "number"],
        model: [data.model, "string"],
        rows: [data.rows, "number"],
        letters: [data.letters, "number"],
        airline: [data.airline, "ID"],
        route: [data.route, "ID"]
    });

    if(Object.keys(parsedData).length === 0) throw Error("Update not valid, please provide at least a new from or to IATA code");

    return parsedData;
}