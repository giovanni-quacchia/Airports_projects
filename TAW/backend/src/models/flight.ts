import mongoose = require('mongoose');
import { checkKeys } from '../utils/utils';

// Interface
export interface Flight{
    date: Date,
    duration: Number, // minutes
    route: mongoose.Types.ObjectId,
    airline: mongoose.Types.ObjectId
}

// Schema

const FlightSchema = new mongoose.Schema<Flight>({
    date: {type: Date, required: true},
    duration: {
        type: Number, 
        min: 0,
        validate: {
            validator: Number.isInteger
        }
    },
    route: {type: mongoose.Schema.ObjectId, ref: 'Route'},
    airline: {type: mongoose.Schema.ObjectId, ref: 'Airline'},
});

// Validate
function validateInput(data: any): boolean{

    if(typeof data !== "object" || data === null || Array.isArray(data)) throw Error("Not valid data");

    const keys = Object.keys(data);

    if(!data.date || !(data.date instanceof Date))
        throw Error("Date required");
    if(!data.duration || typeof data.duration !== 'number')
        throw Error("Duration required");
    if(!data.route || !mongoose.Types.ObjectId.isValid(data.route)) 
        throw Error("Route required");
    if(!data.airline || !mongoose.Types.ObjectId.isValid(data.airline)) 
        throw Error("Airline required");

    // Check if there are not valid keys
    if(keys.length === 4) return true;
    else
        throw Error("Credentials not valid");
}

function validate(data: any): boolean{

    if(typeof data !== "object" || data === null || Array.isArray(data)) throw Error("Not valid data");

    const keys = Object.keys(data);

    if(
        (!data.date || !(data.date instanceof Date)) &&
        (!data.duration || typeof data.duration !== 'number') &&
        (!data.route || !mongoose.Types.ObjectId.isValid(data.route)) &&
        (!data.airline || !mongoose.Types.ObjectId.isValid(data.airline))
    )
        throw Error("Updating a flight requires a new date, duration, route or airline")

    if(data.from && data.to && data.from === data.to) throw Error("Departure and Arrivial airports cannot be the same")

    // Check if there are not valid keys
     // Check if there are not valid keys
    if(checkKeys(keys, ["date", "duration", "route", "airline"])) return true;
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

export default {getModel, createFlight, validate}