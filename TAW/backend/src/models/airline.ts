import mongoose = require('mongoose');
import { getRandomPassword, isObject, isObjectEmpty, isObjSameSize, validateObj, validatePartialObj } from '../utils/utils';
import crypto = require('crypto');
import { AppError } from './AppError';

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
export function validateNew(data: any){

    if(!isObject(data)) throw new AppError("Object expected", 4005);

    const query = validateObj({
        code: [data.code, "string", /^[A-Z]{2}$/],
        mail: [data.mail, "mail"],
        PIVA: [data.PIVA, "string"],
        name: [data.name, "string"],
    });

    const optQuery = validatePartialObj({
        logo: [data.logo, "string"]
    })

    const parsedData = {...query, ...optQuery}

    if(!isObjSameSize(parsedData, data)) throw new AppError("A new Airline must include: code, mail, PIVA, name and optional logo", 4005);

    return parsedData;
}

// TODO: add newPassword
function validatePut(data: any){

    if(!isObject(data)) throw new AppError("Object expected", 4005);

    const parsedData: any = validatePartialObj({
        code: [data.code, "string", /^[A-Z]{2}$/],
        mail: [data.mail, "mail"],
        PIVA: [data.PIVA, "string"],
        name: [data.name, "string"],
        logo: [data.logo, "string"],
        password: [data.password, "password"],
    }); 

    if(isObjectEmpty(parsedData)) throw new AppError("Update not valid, please provide at least a new parameter", 4005);

    return parsedData;
}

export function validateSearch(data: any){

    if(!isObject(data)) throw new AppError("Object expected", 4005);
 
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
    const _airlineModel = getModel();
    const airline = new _airlineModel(data);
    return airline;
}

export default {getModel, newAirline, validateNew, validatePut, validateSearch}