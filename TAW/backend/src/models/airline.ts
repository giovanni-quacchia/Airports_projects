import mongoose = require('mongoose');
import { User } from './user'
import {getModel as getUserModel} from './user'
import { checkKeys, validateObj, validatePartialObj } from '../utils/utils';

// Interface
export interface Airline extends User{

    // mail: string;
    // salt?: string;
    // digest?: string;
    // isFirstLogin?: boolean

    code: String,
    name: String,
    PIVA: String,
    logo: String,
}

// Schema
const AirlineSchema = new mongoose.Schema<Airline>({

    // mail: { type: String, required: true, unique: true },
    // salt: { type: String, required: true},
    // digest: { type: String, required: true},
    // isFirstLogin: {type: Boolean, required: true, default: true},

    code: {type: String, required: true, unique: true},
    name: {type: String, required: true, unique: true},
    PIVA: {type: String, required: true, unique: true},
    logo: {type: String},
});

// Validate
function validateNew(data: any){

    if(typeof data !== "object" || data === null || Array.isArray(data)) throw Error("Not valid data");

    return validateObj({
        code: [data.code, "string", /^[A-Z]{2}$/],
        mail: [data.mail, "mail"],
        PIVA: [data.PIVA, "string"],
        name: [data.name, "string"],
    });
}

function validatePut(data: any){

    if(typeof data !== "object" || data === null || Array.isArray(data)) throw Error("Not valid data");

    const parsedData = validatePartialObj({
        code: [data.code, "string", /^[A-Z]{2}$/],
        mail: [data.mail, "mail"],
        PIVA: [data.PIVA, "string"],
        name: [data.name, "string"],
    }); 

    if(Object.keys(parsedData).length === 0) throw Error("Update not valid, please provide at least a new code, mail, PIVA or name")

    return parsedData;
}

function validateSearch(data: any){

    if(typeof data !== "object" || data === null || Array.isArray(data)) throw Error("Not valid data");

    return validatePartialObj({
        name: [data.name, "string"]
    });
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
    const parsedData = validateNew(data);
    const _airlineModel = getModel();
    const airline = new _airlineModel(parsedData);
    return airline;
}

export default {getModel, newAirline, validatePut, validateSearch}