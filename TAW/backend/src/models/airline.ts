import mongoose = require('mongoose');
import { User } from './user'
import {getModel as getUserModel} from './user'
import { checkKeys } from '../utils/utils';

// Interface
export interface Airline extends User{
    code: String,
    PIVA: String,
    name: String,
    logo: String,
}

// Schema
const AirlineSchema = new mongoose.Schema<Airline>({
    code: {type: String, required: true, unique: true},
    PIVA: {type: String, required: true, unique: true},
    name: {type: String, required: true, unique: true},
    logo: {type: String}
});

// Validate
function validateInput(data: any): boolean{

    if(typeof data !== "object" || data === null || Array.isArray(data)) throw Error("Not valid data");

    const keys = Object.keys(data)

    console.log(data)

    if(!data.code || typeof data.code !== 'string') 
        throw Error("Code required");
    if(!data.mail || typeof data.mail !== 'string') 
        throw Error("Mail required");
    if(!data.PIVA || typeof data.PIVA !== 'string') 
        throw Error("PIVA required");
    if(!data.name || typeof data.name !== 'string') 
        throw Error("name required");
    // Check if there are not valid keys
    if(checkKeys(keys, ["name", "code", "PIVA", "mail", "logo"])) return true;
    else
        throw Error("Not valid data");
}

function validateUpdate(data: any): boolean{

    if(typeof data !== "object" || data === null || Array.isArray(data)) throw Error("Not valid data");

    const keys = Object.keys(data)

    if(
        (!data.mail || typeof data.mail !== 'string') &&
        (!data.PIVA || typeof data.PIVA !== 'string') &&
        (!data.name || typeof data.name !== 'string') &&
        (!data.logo || typeof data.logo !== 'string') &&
        (!data.code || typeof data.code !== 'string') 
    )
        throw Error("Updating an airline requires a new mail, PIVA, name, logo or code")

    // Check if there are not valid keys
    if(checkKeys(keys, ["name", "code", "PIVA", "mail", "logo"])) return true;
    else
        throw Error("Not valid data");
}

function validateSearch(data: any): boolean{

    if(typeof data !== "object" || data === null || Array.isArray(data)) throw Error("Not valid data");

    const keys = Object.keys(data);

    if (keys.length === 0) return true;

    if(
        (!data.name || typeof data.name !== 'string')
    )
        throw Error("Searching an airline not valid"); 

    // Check if there are not valid keys
    if(checkKeys(keys, ["name"])) return true;
    else
        throw Error("Not valid data");
}

// Model

let airlineModel: mongoose.Model<Airline>;
export function getModel(): mongoose.Model<Airline>{
    if(!airlineModel){
        const userModel = getUserModel();
        airlineModel = userModel.discriminator<Airline>('Airline', AirlineSchema);
    }
    return airlineModel;
}

// Partial?
export function newAirline(data: Partial<Airline>): mongoose.HydratedDocument<Airline> {
    validateInput(data);
    const _airlineModel = getModel();
    const airline = new _airlineModel(data);
    return airline;
}

export default {getModel, newAirline, validateUpdate, validateSearch}