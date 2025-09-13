import mongoose = require('mongoose');
import { checkKeys, validateObj, validatePartialObj } from '../utils/utils';

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

export function createAirport(data): mongoose.HydratedDocument<Airport> {
    const _airportModel = getModel();
    const airport = new _airportModel(data);
    return airport;
}

// Validate

function validateNew(data: any){

    if(typeof data !== "object" || data === null || Array.isArray(data)) throw Error("Not valid data");

    return validateObj({
        name: [data.name, "string"],
        city: [data.city, "string"],
        code: [data.code, "IATA"],
        country: [data.country, "string"]
    });
}

export function validatePut(data: any){

    if(typeof data !== "object" || data === null || Array.isArray(data)) throw Error("Not valid data");

    const parsedData = validatePartialObj({
        name: [data.name, "string"],
        city: [data.city, "string"],
        code: [data.code, "IATA"],
        country: [data.country, "string"]
    })

    if(Object.keys(parsedData).length === 0) throw Error("Update not valid, please provide at least a new code, name city or country")

    return parsedData;
}

function validateSearch(data: any){

    if(typeof data !== "object" || data === null || Array.isArray(data)) throw Error("Not valid data");

    return validatePartialObj({
        q: [data.q, "string"]
    });
}


export default {getModel, createAirport, validateNew, validatePut, validateSearch}