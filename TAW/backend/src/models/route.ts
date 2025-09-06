import mongoose = require('mongoose');
import { checkKeys } from '../utils/utils';

// Interface
export interface Route{
    from: mongoose.Schema.Types.ObjectId,
    to: mongoose.Schema.Types.ObjectId
}

// Schema

const RouteSchema = new mongoose.Schema<Route>({
    from: {type: mongoose.Schema.Types.ObjectId, ref: 'Airport', required: true},
    to: {type: mongoose.Schema.Types.ObjectId, ref: 'Airport', required: true}
});

//Validate
function validateInput(data: any): boolean{

    if(typeof data !== "object" || data === null || Array.isArray(data)) throw Error("Not valid data");

    const keys = Object.keys(data);

    if(!data.from || !mongoose.Types.ObjectId.isValid(data.from)) 
        throw Error("Departure airport required");
    if(!data.to || !mongoose.Types.ObjectId.isValid(data.to)) 
        throw Error("Arrival airport required");

    if(data.from === data.to) throw Error("Departure and Arrivial airports cannot be the same")

    // Check if there are not valid keys
    if(keys.length === 2) return true;
    else
        throw Error("Credentials not valid");
}

function validate(data: any): boolean{

    if(typeof data !== "object" || data === null || Array.isArray(data)) throw Error("Not valid data");

    const keys = Object.keys(data);

    if(
        (!data.from || !mongoose.Types.ObjectId.isValid(data.from)) &&
        (!data.to || !mongoose.Types.ObjectId.isValid(data.to))
    )
        throw Error("Updating a route requires a new departure or arrival airport")

    if(data.from && data.to && data.from === data.to) throw Error("Departure and Arrivial airports cannot be the same")

    // Check if there are not valid keys
     // Check if there are not valid keys
    if(checkKeys(keys, ["from", "to"])) return true;
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
        (!data.toCountry || typeof data.toCountry !== 'string')
    )
        throw Error("Searching a route not valid");

    // Check if there are not valid keys
    if(checkKeys(keys, ["fromCity", "toCity", "fromCountry", "toCountry"])) return true;
    else
        throw Error("Not valid data");
}

// Model

let routeModel: mongoose.Model<Route>;
export function getModel(): mongoose.Model<Route> {
    if(!routeModel) routeModel = mongoose.model<Route>('Route', RouteSchema);
    return routeModel;
}

export function createRoute(data): mongoose.HydratedDocument<Route> {
    validateInput(data);
    const _routeModel = getModel();
    const route = new _routeModel(data);
    return route;
}

export default {getModel, createRoute, validate, validateSearch}