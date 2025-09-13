import mongoose = require('mongoose');
import { checkKeys, isObject, isObjSameSize, validateObj, validatePartialObj } from '../utils/utils';

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
export function validateNew(data: any){

    if(!isObject(data)) throw Error("Object expected");

    const query: any = validateObj({
        from: [data.from, "ID"],
        to: [data.to, "ID"],
    });

    if(query.from === query.to) throw Error("Departure and Arrivial airports cannot be the same")

    if(!isObjSameSize(query, data)) throw Error("A new Route must include: from, to")

    return query;
}

function validatePut(data: any){

    if(!isObject(data)) throw Error("Object expected");

    const parsedData: any = validatePartialObj({
        from: [data.from, "ID"],
        to: [data.to, "ID"]
    })

    if(Object.keys(parsedData).length === 0) throw Error("Update not valid, please provide at least a new from or to IATA code");

    if(parsedData.from && parsedData.to && parsedData.from === parsedData.to) throw Error("Departure and Arrivial airports cannot be the same");

    return parsedData;
}

function validateSearch(data: any){

    if(!isObject(data)) throw Error("Object expected");

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

export function newRoute(data): mongoose.HydratedDocument<Route> {
    const _routeModel = getModel();
    const route = new _routeModel(data);
    return route;
}

export default {getModel, newRoute, validateNew, validatePut, validateSearch}