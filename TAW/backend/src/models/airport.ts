import mongoose = require('mongoose');
import { checkKeys } from '../utils/utils';

// Interface
export interface Airport{
    name: string,
    city: string,
    code: string,
    country: string
}

// Schema

const AirportSchema = new mongoose.Schema<Airport>({
    name: {type: String},
    city: {type: String},
    code: {
        type: String,
        unique: true,
        match: /^[A-Z]{3}$/ // regex for 3 uppercase letters
    }, 
    country: {type: String}
});

// Model
// Discriminator: 

let airportModel: mongoose.Model<Airport>;
export function getModel(): mongoose.Model<Airport> {
    if(!airportModel) airportModel = mongoose.model<Airport>('Airport', AirportSchema);
    return airportModel;
}

export function createAirport(data): mongoose.HydratedDocument<Airport> {
    validateInput(data)
    const _airportModel = getModel();
    const airport = new _airportModel(data);
    return airport;
}

// Validate

function validateInput(data: any): boolean{

    if(typeof data !== "object" || data === null || Array.isArray(data)) throw Error("Not valid data");

    const keys = Object.keys(data)

    if(!data.name || typeof data.name !== 'string') 
        throw Error("Name required");
    if(!data.city || typeof data.city !== 'string') 
        throw Error("City required");
    if(!data.code || typeof data.code !== 'string') 
        throw Error("Code required");
    if(!/^[A-Z]{3}$/.test(data.code))
        throw Error("Code is not valid");
    if(!data.country || typeof data.country !== 'string') 
        throw Error("Country required");
    
    // Check if there are not valid keys
    if(checkKeys(keys, ["name", "city", "code", "country"])) return true;
    else
        throw Error("Not valid data");
}

export function validateUpdate(data: any): boolean{

    if(typeof data !== "object" || data === null || Array.isArray(data)) throw Error("Not valid data");

    const keys = Object.keys(data)

    if(
        (!data.name || typeof data.name !== 'string') &&
        (!data.city || typeof data.city !== 'string') &&
        (!data.code || typeof data.code !== 'string') &&
        (!data.country || typeof data.country !== 'string')
    )
        throw Error("Updating an airport requires a new name, city, code or country")

    if(data.code && !/^[A-Z]{3}$/.test(data.code))
        throw Error("Code is not valid");

    // Check if there are not valid keys
    if(checkKeys(keys, ["name", "city", "code", "country"])) return true;
    else
        throw Error("Not valid data");
}

export default {getModel, createAirport, validateUpdate}