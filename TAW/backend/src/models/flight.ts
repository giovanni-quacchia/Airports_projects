import mongoose = require('mongoose');
import { checkKeys } from '../utils/utils';

// Interface
export interface Flight{
    code: String
    departure: Date,
    arrival: Date
    duration: Number, // minutes
    route: mongoose.Schema.Types.ObjectId,
    airline: mongoose.Schema.Types.ObjectId,
    airplane: mongoose.Schema.Types.ObjectId
}

// Schema

const FlightSchema = new mongoose.Schema<Flight>({
    code: {type: String, required: true},
    departure: {type: Date, required: true},
    arrival: {type: Date, required: true},
    duration: {
        type: Number, 
        min: 0,
        validate: {
            validator: Number.isInteger
        }
    },
    route: {type: mongoose.Schema.Types.ObjectId, ref: 'Route'},
    airline: {type: mongoose.Schema.Types.ObjectId, ref: 'Airline'},
    airplane: {type: mongoose.Schema.Types.ObjectId, ref: 'Airplane'},
});

// Validate
function validateInput(data: any): boolean{

    if(typeof data !== "object" || data === null || Array.isArray(data)) throw Error("Not valid data");

    const keys = Object.keys(data);

    data.departure = new Date(data.departure)
    data.arrival = new Date(data.arrival)

    if(!data.code || typeof data.code !== 'string')
        throw Error("Code required");
    if(!data.departure || isNaN(data.departure))
        throw Error("Departure date required");
    if(!data.arrival || isNaN(data.arrival))
        throw Error("Arrival date required");
    if(!data.duration || typeof data.duration !== 'number')
        throw Error("Duration required");
    if(!data.route || !mongoose.Types.ObjectId.isValid(data.route)) 
        throw Error("Route required");
    if(!data.airline || !mongoose.Types.ObjectId.isValid(data.airline)) 
        throw Error("Airline required");
    if(!data.airplane || !mongoose.Types.ObjectId.isValid(data.airplane)) 
        throw Error("Airplane required");

    // Check if there are not valid keys
    if(keys.length === 7) return true;
    else
        throw Error("Not valid data");
}

function validate(data: any): boolean{

    if(typeof data !== "object" || data === null || Array.isArray(data)) throw Error("Not valid data");

    const keys = Object.keys(data);

    const testDeparture = new Date(data.departure)
    const testArrival = new Date(data.arrival)

    if(
        (!data.code || typeof data.code !== 'string') &&
        (!data.departure || isNaN(+testDeparture)) &&
        (!data.arrival || isNaN(+testArrival)) &&
        (!data.duration || typeof data.duration !== 'number') &&
        (!data.route || !mongoose.Types.ObjectId.isValid(data.route)) &&
        (!data.airline || !mongoose.Types.ObjectId.isValid(data.airline)) &&
        (!data.airplane || !mongoose.Types.ObjectId.isValid(data.airplane))
    )
        throw Error("Updating a flight requires a new departure date, arrival date, duration, route, airline or airplane")
    if(data.from && data.to && data.from === data.to) throw Error("Departure and Arrivial airports cannot be the same")

    // Check if there are not valid keys
     // Check if there are not valid keys
    if(checkKeys(keys, ["departure", "arrival", "duration", "route", "airline", "code", "airplane"])) return true;
    else
        throw Error("Not valid data");
}

function validateSearch(data: any): boolean{

    if(typeof data !== "object" || data === null || Array.isArray(data)) throw Error("Not valid data");

    const keys = Object.keys(data);

    if (keys.length === 0) return true;

    if(
        (!data.from || typeof data.from !== 'string') &&
        (!data.to || typeof data.to !== 'string') &&
        (!data.fromDate || typeof data.fromDate !== 'string') &&
        (!data.toDate || typeof data.toDate !== 'string') &&
        (!data.airline || typeof data.airline !== 'string') &&
        (!data.sortBy || typeof data.sortBy !== 'string') &&
        (!data.order || typeof data.order !== 'string') && 
        (!data.airplane || typeof data.airplane !== 'string') &&
        (!data.code || typeof data.code !== 'string')
    )
        throw Error("Searching a flight not valid");

    if(data.onlyDirect) data.onlyDirect = (data.onlyDirect === 'true');  

    if(
        (data.sortBy && data.sortBy !== "duration" && data.sortBy !== "departure" && data.sortBy !== "arrival") || 
        (data.order && !data.sortBy)
    )
        throw Error("Sorting parameters not valid");

    if(data.order && data.order !== "desc" && data.order !== "asc")
        throw Error("Order parameter not valid");

    // Check if there are not valid keys
    if(checkKeys(keys, ["from", "to", "fromDate", "toDate", "airline", "sortBy", "order", "airplane", "code"])) return true;
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