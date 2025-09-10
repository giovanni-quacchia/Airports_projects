import mongoose = require('mongoose');
import { getRandomPassword, validateObj, validatePartialObj } from '../utils/utils';
import crypto = require('crypto');

// Interface
export interface Airline{

    mail: string;
    salt?: string;
    digest?: string;
    isFirstLogin?: boolean

    code: String,
    name: String,
    PIVA: String,
    logo?: String,

    setPassword(pwd: string): void;
    checkPassword(pwd: string): boolean;
}

// Schema
const AirlineSchema = new mongoose.Schema<Airline>({

    mail: { type: String, required: true, unique: true },
    salt: { type: String, required: true},
    digest: { type: String, required: true},
    isFirstLogin: {type: Boolean, required: true, default: true},

    code: {type: String, required: true, unique: true},
    name: {type: String, required: true, unique: true},
    PIVA: {type: String, required: true, unique: true},
    logo: {type: String, unique: true},
});

// Methods

AirlineSchema.methods.setPassword = function(this: Airline, pwd: string){
    this.salt = getRandomPassword(16);
    const hmac = crypto.createHmac("sha512", this.salt);
    hmac.update(pwd);
    this.digest = hmac.digest("hex");
}

AirlineSchema.methods.checkPassword = function(this: Airline, pwd: string){
    const hmac = crypto.createHmac("sha512", this.salt);
    hmac.update(pwd);
    const digest = hmac.digest("hex");
    return (this.digest == digest);
}

// Validate
function validateNew(data: any){

    if(typeof data !== "object" || data === null || Array.isArray(data)) throw Error("Not valid data");

    // TODO: come gestire field logo opzionale?

    return validateObj({
        code: [data.code, "string", /^[A-Z]{2}$/],
        mail: [data.mail, "mail"],
        PIVA: [data.PIVA, "string"],
        name: [data.name, "string"],
        logo: [data.logo, "string"] // TODO: opzionale
    });
}

function validatePut(data: any){

    if(typeof data !== "object" || data === null || Array.isArray(data)) throw Error("Not valid data");

    // TODO: add password type like email

    const parsedData = validatePartialObj({
        code: [data.code, "string", /^[A-Z]{2}$/],
        mail: [data.mail, "mail"],
        PIVA: [data.PIVA, "string"],
        name: [data.name, "string"],
        logo: [data.logo, "string"],
        password: [data.password, "string"]
    }); 

    if(Object.keys(parsedData).length === 0) throw Error("Update not valid, please provide at least a new code, mail, password, PIVA or name")

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
    if(!airlineModel) airlineModel = mongoose.model<Airline>('Airline', AirlineSchema);
    return airlineModel;
}

export function newAirline(data: Partial<Airline>): mongoose.HydratedDocument<Airline> {
    const parsedData = validateNew(data);
    const _airlineModel = getModel();
    const airline = new _airlineModel(parsedData);
    return airline;
}

export default {getModel, newAirline, validatePut, validateSearch}