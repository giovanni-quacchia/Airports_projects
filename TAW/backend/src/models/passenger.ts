import mongoose = require('mongoose');
import { checkKeys } from '../utils/utils';

// Interface
export interface Passenger{
    name: String;
    surname: String;
    CF?: String;
    passportNumber?: String;
    extra: Array<'LARGER SEAT' | 'PRIORITY' | 'EXTRA BAG'>;
    seat: String;
    ticket: mongoose.Schema.Types.ObjectId;
}

// Schema: CF or passportNumber

const passengerSchema = new mongoose.Schema<Passenger>({
    name: {type: String, required: true},
    surname: {type: String, required: true},
    CF: {
        type: String,
        validate: {
            validator: function(this: Passenger, value: string){
                return !!value || !!this.passportNumber; // \!! converts to boolean
            }
        }
    },
    passportNumber: {
        type: String,
        validate: {
            validator: function(this: Passenger, value: string){
                return !!value || !!this.passportNumber; // \!! converts to boolean
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
            match: /^[A-Z]\d+$/ // ensures format like "A1", "C12"
    },
    ticket: {type: mongoose.Schema.Types.ObjectId, ref: "Ticket"},
});

// Model

let passengerModel: mongoose.Model<Passenger>;
export function getModel(): mongoose.Model<Passenger>{
    if(!passengerModel) passengerModel = mongoose.model<Passenger>('Passenger', passengerSchema);
    return passengerModel;
}

export function createPassenger(data): mongoose.HydratedDocument<Passenger> {
    validateInput(data);
    const _passengerModel = getModel();
    const passenger = new _passengerModel(data);
    return passenger;
}

// Validate

function validateInput(data: any): boolean{

    if(typeof data !== "object" || data === null || Array.isArray(data)) throw Error("Not valid data");

    const keys = Object.keys(data)

    if(!data.name || typeof data.name !== 'string') 
        throw Error("Name required");
    if(!data.surname || typeof data.city !== 'string') 
        throw Error("Surname required");
    if(
        (!data.CF || typeof data.CF !== 'string') && 
        (!data.passportNumber || typeof data.passportNumber !== 'string'))
        throw Error("CF or Passport Number required");
    
        // Extra
    if (data.extra) {
        if (!Array.isArray(data.extra)) throw Error("Extra must be an array");
        const allowedExtras = ["LARGER SEAT", "PRIORITY", "EXTRA BAG"];
        for (const e of data.extra) {
            if (!allowedExtras.includes(e)) throw Error(`Invalid extra: ${e}`);
        }
    }
    // Seat
    if (!data.seat || typeof data.seat !== 'string')
        throw Error("Seat required");
    if (!/^[A-Z]\d+$/.test(data.seat))
        throw Error("Seat must be in format like 'A1', 'C12'");

    // Ticket
    if (!data.ticket || !mongoose.isValidObjectId(data.ticket))
        throw Error("Ticket must be a valid ObjectId");

    // Check if there are not valid keys
    if (checkKeys(keys, ["name", "surname", "CF", "passportNumber", "extra", "seat", "ticket"])) return true;
    else
        throw Error("Not valid data");
}

export function validate(data: any): boolean{

    if(typeof data !== "object" || data === null || Array.isArray(data)) throw Error("Not valid data");

    const keys = Object.keys(data)

    if(
        (!data.name || typeof data.name !== 'string') &&
        (!data.surname || typeof data.surname !== 'string') &&
        (!data.CF || typeof data.CF !== 'string') &&
        (!data.passportNumber || typeof data.passportNumber !== 'string') &&
        (!data.extra || !Array.isArray(data.extra)) &&
        (!data.seat || typeof data.seat !== 'string') &&
        (!data.ticket || !mongoose.isValidObjectId(data.ticket))
    )
        throw Error("Updating a passenger requires a new name, surname, CF, Passport number, extra, seat or ticket")

    // Check if there are not valid keys
    if (checkKeys(keys, ["name", "surname", "CF", "passportNumber", "extra", "seat", "ticket"])) return true;
    else
        throw Error("Not valid data");
}

export default {getModel, createPassenger, validate}