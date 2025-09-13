import mongoose = require('mongoose');
import { checkKeys, isObject, isObjectEmpty, isObjSameSize, validateObj, validatePartialObj } from '../utils/utils';
import { AppError } from './AppError';

// Interface
export interface Airport{
    name: string,
    city: string,
    code: string,
    country: string
}

// Schema

const AirportSchema = new mongoose.Schema<Airport>({
    name: {type: String, required: true},
    city: {type: String, required: true},
    code: {
        type: String,
        required: true,
        unique: true,
        match: /^[A-Z]{3}$/ // regex for 3 uppercase letters
    }, 
    country: {type: String, required: true}
});

// Model

let airportModel: mongoose.Model<Airport>;
export function getModel(): mongoose.Model<Airport> {
    if(!airportModel) airportModel = mongoose.model<Airport>('Airport', AirportSchema);
    return airportModel;
}

export function newAirport(data): mongoose.HydratedDocument<Airport> {
    validateNew(data);
    const _airportModel = getModel();
    const airport = new _airportModel(data);
    return airport;
}

// Validate

export function validateNew(data: any){

    if(!isObject(data)) throw new AppError("Object expected", 4005);

    const query = validateObj({
        name: [data.name, "string"],
        city: [data.city, "string"],
        code: [data.code, "IATA"],
        country: [data.country, "string"]
    });

    if(!isObjSameSize(query, data)) throw new AppError("A new airport must include: name, city, code, country", 4005)

    return query;
}

export function validatePut(data: any){

    if(!isObject(data)) throw new AppError("Object expected", 4005);

    const query = validatePartialObj({
        name: [data.name, "string"],
        city: [data.city, "string"],
        code: [data.code, "IATA"],
        country: [data.country, "string"]
    })

    if(isObjectEmpty(query)) throw new AppError("Update not valid, please provide at least a new code, name, city or country", 4005)

    return query;
}

export function validateSearch(data: any){
    
    if(!isObject(data)) throw new AppError("Object expected", 4005);

    const query = validatePartialObj({
        q: [data.q, "string"]
    });

    return query;
}


export default {getModel, newAirport, validateNew, validatePut, validateSearch}