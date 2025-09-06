import mongoose = require('mongoose');
import { checkKeys } from '../utils/utils';

// Interface
export interface Flight{
    code: String
    date: Date,
    duration: Number, // minutes
    route: mongoose.Schema.Types.ObjectId,
    airline: mongoose.Schema.Types.ObjectId
}

// Schema

const FlightSchema = new mongoose.Schema<Flight>({
    code: {type: String, required: true},
    date: {type: Date, required: true},
    duration: {
        type: Number, 
        min: 0,
        validate: {
            validator: Number.isInteger
        }
    },
    route: {type: mongoose.Schema.Types.ObjectId, ref: 'Route'},
    airline: {type: mongoose.Schema.Types.ObjectId, ref: 'Airline'},
});

// Validate
function validateInput(data: any): boolean{

    if(typeof data !== "object" || data === null || Array.isArray(data)) throw Error("Not valid data");

    const keys = Object.keys(data);

    if(!data.code || typeof data.code !== 'string')
        throw Error("Code required");
    if(!data.date || !(data.date instanceof Date))
        throw Error("Date required");
    if(!data.duration || typeof data.duration !== 'number')
        throw Error("Duration required");
    if(!data.route || !mongoose.Types.ObjectId.isValid(data.route)) 
        throw Error("Route required");
    if(!data.airline || !mongoose.Types.ObjectId.isValid(data.airline)) 
        throw Error("Airline required");

    // Check if there are not valid keys
    if(keys.length === 5) return true;
    else
        throw Error("Not valid data");
}

function validate(data: any): boolean{

    if(typeof data !== "object" || data === null || Array.isArray(data)) throw Error("Not valid data");

    const keys = Object.keys(data);

    if(
        (!data.code || typeof data.code !== 'string') &&
        (!data.date || !(data.date instanceof Date)) &&
        (!data.duration || typeof data.duration !== 'number') &&
        (!data.route || !mongoose.Types.ObjectId.isValid(data.route)) &&
        (!data.airline || !mongoose.Types.ObjectId.isValid(data.airline))
    )
        throw Error("Updating a flight requires a new date, duration, route or airline")

    if(data.from && data.to && data.from === data.to) throw Error("Departure and Arrivial airports cannot be the same")

    // Check if there are not valid keys
     // Check if there are not valid keys
    if(checkKeys(keys, ["date", "duration", "route", "airline", "code"])) return true;
    else
        throw Error("Not valid data");
}

function validateSearch(data: any): boolean{

    if(typeof data !== "object" || data === null || Array.isArray(data)) throw Error("Not valid data");

    const keys = Object.keys(data);

    if (keys.length === 0) return true;

    if(
        (!data.fromCity || typeof data.fromCity !== 'string') &&
        (!data.toCity || typeof data.toCity !== 'string') &&
        (!data.fromCountry || typeof data.fromCountry !== 'string') &&
        (!data.toCountry || typeof data.toCountry !== 'string') &&
        (!data.fromDate || typeof data.fromDate !== 'string') &&
        (!data.toDate || typeof data.toDate !== 'string')
    )
        throw Error("Searching a route not valid");
        
    // Check if there are not valid keys
    if(checkKeys(keys, ["fromCity", "toCity", "fromCountry", "toCountry", "fromDate", "toDate"])) return true;
    else
        throw Error("Not valid data");
}

// Model

let flightModel: mongoose.Model<Flight>;
export function getModel(): mongoose.Model<Flight> {
    if(!flightModel) flightModel = mongoose.model<Flight>('Flight', FlightSchema);
    return flightModel;
}

export function createFlight(data): mongoose.HydratedDocument<Flight> {
    validateInput(data);
    const _flightModel = getModel();
    const flight = new _flightModel(data);
    return flight;
}

export default {getModel, createFlight, validate, validateSearch}