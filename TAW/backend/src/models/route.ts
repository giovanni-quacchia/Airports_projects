import mongoose = require('mongoose');
import { checkKeys, validateObj, validatePartialObj } from '../utils/utils';

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

// TODO: sistemare validate, poi aggiungere sortBy, ricerca
export function validateNew(data: any): boolean{

    if(typeof data !== "object" || data === null || Array.isArray(data)) throw Error("Route must be an object");

    const query: any = validateObj({
        from: [data.from, "IATA"],
        to: [data.to, "IATA"],
    });

    if(query.from === query.to) throw Error("Departure and Arrivial airports cannot be the same")

    return query;
}

function validate(data: any){

    if(typeof data !== "object" || data === null || Array.isArray(data)) throw Error("Not valid data");

    const parsedData = validatePartialObj({
        from: [data.from, "IATA"],
        to: [data.to, "IATA"]
    })

    if(Object.keys(parsedData).length === 0) throw Error("Update not valid, please provide at least a new from or to IATA code");

    if(data.from && data.to && data.from === data.to) throw Error("Departure and Arrivial airports cannot be the same");

    return parsedData;
}

function validateSearch(data: any){

    if(typeof data !== "object" || data === null || Array.isArray(data)) throw Error("Not valid data");

    return validatePartialObj({
        from: [data.from, "string"],
        to: [data.to, "string"]
    });
}

// Model

let routeModel: mongoose.Model<Route>;
export function getModel(): mongoose.Model<Route> {
    if(!routeModel) routeModel = mongoose.model<Route>('Route', RouteSchema);
    return routeModel;
}

export function createRoute(data): mongoose.HydratedDocument<Route> {
    validateNew(data);
    const _routeModel = getModel();
    const route = new _routeModel(data);
    return route;
}

export default {getModel, createRoute, validateNew, validate, validateSearch}