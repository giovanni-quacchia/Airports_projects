import mongoose = require('mongoose');
import { User } from './user'
import {getModel as getUserModel} from './user'

// Interface
export interface Airline extends User{
    PIVA: string,
    name: string,
    logo: string,
}

// Schema
const AirlineSchema = new mongoose.Schema<Airline>({
    PIVA: {type: String, required: true, unique: true},
    name: {type: String, required: true, unique: true},
    logo: {type: String}
});

// Validate
function validateInput(data: any): boolean{

    if(typeof data !== "object" || data === null || Array.isArray(data)) throw Error("Not valid data");

    const keys = Object.keys(data)

    if(!data.mail || typeof data.mail !== 'string') 
        throw Error("Mail required");
    if(!data.PIVA || typeof data.PIVA !== 'string') 
        throw Error("PIVA required");
    if(!data.name || typeof data.name !== 'string') 
        throw Error("PIVA required");
    // Check if there are not valid keys
    const validKeys = ["mail", "PIVA", "name", "logo"];
    keys.forEach(key => {
        if(!validKeys.includes(key))
            throw Error("Not valid data");
        })
    return true;
}

function validateUpdate(data: any): boolean{

    if(typeof data !== "object" || data === null || Array.isArray(data)) throw Error("Not valid data");

    const keys = Object.keys(data)

    if(
        (!data.mail || typeof data.mail !== 'string') &&
        (!data.PIVA || typeof data.PIVA !== 'string') &&
        (!data.name || typeof data.name !== 'string') &&
        (!data.logo || typeof data.logo !== 'string') 
    )
        throw Error("Updating an airline requires a new mail, PIVA, name or logo")
    // Check if there are not valid keys
    const validKeys = ["mail", "PIVA", "name", "logo"];
    keys.forEach(key => {
        if(!validKeys.includes(key))
            throw Error("Not valid data");
        })
    return true;
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

export default {getModel, newAirline, validateUpdate}