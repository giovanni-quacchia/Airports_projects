import mongoose = require('mongoose');
import { Route } from './Route';
import { Airline } from './Airline';

// Interface
export interface Flight{
    date: Date,
    duration: Number, // minutes
    route: Route,
    airline: Airline
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

// Model

let flightModel: mongoose.Model<Flight>;
export function getModel(): mongoose.Model<Flight> {
    if(!flightModel) flightModel = mongoose.model<Flight>('Flight', FlightSchema);
    return flightModel;
}

export function newAirplane(data): Flight {
    const _flightModel = getModel();
    const flight = new _flightModel(data);
    return flight;
}