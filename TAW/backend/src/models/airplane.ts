import mongoose = require('mongoose');
import { validateObj, validatePartialObj, isObject, isObjSameSize } from '../utils/utils';
import { AppError } from './AppError';
import { start } from 'repl';

// Interface
export interface Airplane{
    code: number,
    model: string,
    airline: mongoose.Schema.Types.ObjectId,
    rows: number,
    letters: number,
    route?: mongoose.Schema.Types.ObjectId,

    // periodo
    startDate?: Date,
    endDate?: Date
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

    startDate: {type: Date},
    endDate: {type: Date}
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

    if(!isObject(data)) throw new AppError("Object expected", 4005);

    let query: any = validateObj({
        code: [data.code, "number"],
        model: [data.model, "string"],
        rows: [data.rows, "number"],
        letters: [data.letters, "number"],
        airline: [data.airline, "ID"],
    });

    if(data.route){
        const routeData = validateObj({
            route: [data.route, "ID"],
            startDate: [data.startDate, "date"],
            endDate: [data.endDate, "date"]
        })
        query = {...query, ...routeData};
    }

    if(!isObjSameSize(query, data)) throw new AppError("A new airplane must include: code, model, rows, letter, airline and optional route, startDate and endDate", 4005)

    return query;
}

export function validatePut(data: any){

    if(!isObject(data)) throw new AppError("Object expected", 4005);

    const parsedData = validatePartialObj({
        code: [data.code, "number"],
        model: [data.model, "string"],
        rows: [data.rows, "number"],
        letters: [data.letters, "number"],
        airline: [data.airline, "ID"],
        route: [data.route, "ID"]
    });

    if(!isObjSameSize(parsedData, data)) throw new AppError("Update not valid, please provide at least a new parameter", 4005);

    return parsedData;
}