import mongoose = require('mongoose');
import { isObject, isObjectEmpty, isObjSameSize, validateObj, validatePartialObj } from '../utils/utils';
import { AppError } from './AppError';

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
        required: true,
        validate: {
            validator: Number.isInteger
        }
    },
    route: {type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true},
    airline: {type: mongoose.Schema.Types.ObjectId, ref: 'Airline', required: true},
    airplane: {type: mongoose.Schema.Types.ObjectId, ref: 'Airplane', required: true},
});

// Validate
export function validateNew(data: any){

    if(!isObject(data)) throw new AppError("Object expected", 4005);

    const query: any = validateObj({
        code: [data.code, "string"],
        departure: [data.departure, "date"],
        arrival: [data.arrival, "date"],
        duration: [data.duration, "number"],
        route: [data.route, "ID"],
        airline: [data.airline, "ID"],
        airplane: [data.airplane, "ID"]
    });

    if(query.departure > query.arrival) throw new AppError("Departure date cannot be after arrival date", 4005);

    if(!isObjSameSize(query, data)) throw new AppError("A new Flight must include: code, departure, arrival, duration, route, airline, airplane", 4005);
    
    return query;
}

export function validatePut(data: any){

    if(!isObject(data)) throw new AppError("Object expected", 4005);

    const query: any = validatePartialObj({
        code: [data.code, "string"],
        departure: [data.departure, "date"],
        arrival: [data.arrival, "date"],
        duration: [data.duration, "number"],
        route: [data.route, "ID"],
        airline: [data.airline, "ID"],
        airplane: [data.airplane, "ID"]
    });

    if(isObjectEmpty(query)) throw new AppError("Update not valid, please provide at least a new parameter", 4005);
        
    if(query.departure && query.arrival && query.departure > query.arrival) throw new AppError("Departure date cannot be after arrival date", 4005);

    return query;
}

export function validateSearch(data: any){

    if(!isObject(data)) throw new AppError("Object expected", 4005);

    const query = validatePartialObj({
        from: [data.from, "string"],
        to: [data.to, "string"],
        fromDate: [data.fromDate, "date"],
        toDate: [data.toDate, "date"],
        airline: [data.airline, "string"],
        sortBy: [data.sortBy, "string"],
        order: [data.order, "string"],
        airplane: [data.airplane, "string"],
        code: [data.code, "string"],
        statistics: [data.statistics, "boolean"],
    });

    // sortBy: duration, departure, arrival
    if(data.sortBy && !["duration", "departure", "arrival"].includes(data.sortBy))
        throw new AppError("Flights can be sorted by duration, departure or arrival", 4005)

    if(data.order && !data.sortBy) throw new AppError("Please provide sortBy value", 4005)

    if(data.order && data.order !== "desc" && data.order !== "asc")
        throw new AppError("Order value must be desc or asc", 4005);

    return query;
}

// Model

let flightModel: mongoose.Model<Flight>;
export function getModel(): mongoose.Model<Flight> {
    if(!flightModel) flightModel = mongoose.model<Flight>('Flight', FlightSchema);
    return flightModel;
}

export function newFlight(data): mongoose.HydratedDocument<Flight> {
    const _flightModel = getModel();
    const flight = new _flightModel(data);
    return flight;
}

export default {getModel, newFlight, validateNew, validatePut, validateSearch}