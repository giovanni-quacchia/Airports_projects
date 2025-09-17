import mongoose = require('mongoose');
import { checkKeys, isObject, isObjectEmpty, isObjSameSize, validateObj, validatePartialObj } from '../utils/utils';
import { AppError } from './AppError';

// Interface
export interface Passenger{
    name: String;
    surname: String;
    CF?: String;
    passportNumber?: String;
    extra?: Array<'LARGER SEAT' | 'PRIORITY' | 'EXTRA BAG'>;
    seat: String;
    purchase: mongoose.Schema.Types.ObjectId
}

// Schema: CF or passportNumber

const passengerSchema = new mongoose.Schema<Passenger>({
    name: {type: String, required: true},
    surname: {type: String, required: true},
    CF: {
        type: String,
        validate: {
            validator: function(this: Passenger, value: string){
                return !!value || !!this.passportNumber; // !! converts to boolean
            }
        }
    },
    passportNumber: {
        type: String,
        validate: {
            validator: function(this: Passenger, value: string){
                return !!value || !!this.passportNumber; //!! converts to boolean
            }
        }
    },
    extra: {
        type: [String],
        enum: ["LARGER SEAT", "PRIORITY", "EXTRA BAG"],
        default: []
    },
    seat: {
        type: String,
        required: true,
        match: /^[A-Z]([1-9]\d*)$/ // ensures format like "A1", "C12"
    },
    purchase: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "Purchase",
        required: true
    }
});

// Model

let passengerModel: mongoose.Model<Passenger>;
export function getModel(): mongoose.Model<Passenger>{
    if(!passengerModel) passengerModel = mongoose.model<Passenger>('Passenger', passengerSchema);
    return passengerModel;
}

export function newPassenger(data): mongoose.HydratedDocument<Passenger> {
    const _passengerModel = getModel();
    const passenger = new _passengerModel(data);
    return passenger;
}

// Validate

export function validateNew(data: any){

    if(!isObject(data)) throw new AppError("Object expected", 4005);

    const query = validateObj({
        name: [data.name, "string"],
        surname: [data.surname, "string"],
        seat: [data.seat, "string", /^[A-Z]([1-9]\d*)$/],
        purchase: [data.purchase, "ID"]
    })

    const optQuery: any = validatePartialObj({
        CF: [data.CF, "string"],
        passportNumber: [data.passportNumber, "string"],
        extra: [data.extra, "arrayOfStrings"]
    })

    if(!optQuery.CF && !optQuery.passportNumber)
        throw new AppError("CF or Passport Number required", 4005);

    if(data.extra){
        for(const extra of data.extra){
            if(!["LARGER SEAT", "PRIORITY", "EXTRA BAG"].includes(extra))
                throw new AppError(`Invalid extra: ${extra}`, 4005);
        }
    }

    const parsedData = {...query, ...optQuery};
    if(!isObjSameSize(parsedData, data)) throw new AppError("A new Passenger must include: name, surname, seat, purchase ID. CF or passportNumber and extra", 4005);
    return parsedData;
}

export function validatePut(data: any){

    if(!isObject(data)) throw new AppError("Object expected", 4005);

    const query = validatePartialObj({
        name: [data.name, "string"],
        surname: [data.surname, "string"],
        CF: [data.CF, "string"],
        passportNumber: [data.passportNumber, "string"],
        extra: [data.extra, "arrayOfStrings"],
        seat: [data.seat, "string", /^[A-Z]\d+$/],
    });

    if(isObjectEmpty(query)) throw new AppError("Update not valid, please provide at least a new parameter", 4005);
    return query;
}

export function validateSearch(data: any){

    if(!isObject(data)) throw new AppError("Object expected", 4005);

    const query: any = validatePartialObj({
        CF: [data.CF, "string"],
        passportNumber: [data.passportNumber, "string"],
        name: [data.name, "string"],
        surname: [data.surname, "string"],
        seat: [data.seat, "string"],
        sortBy: [data.sortBy, "string"],
        order: [data.order, "string"],
    });

    if(
        (query.sortBy && !["name", "surname", "seat", "CF", "passportNumber"].includes(query.sortBy)) || 
        (query.order && !query.sortBy)
    )
        throw new AppError("Sorting parameters not valid", 4005);

    if(query.order && query.order !== "desc" && query.order !== "asc")
        throw new AppError("Order parameter not valid", 4005);

    return query;
}

export default {getModel, newPassenger, validatePut, validateNew, validateSearch}