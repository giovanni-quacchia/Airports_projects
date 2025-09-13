import mongoose = require('mongoose');
import { isObject, isObjectEmpty, isObjSameSize, validateObj, validatePartialObj } from '../utils/utils';
import { AppError } from './AppError';

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

export function validateNew(data: any){

    if(!isObject(data)) throw new AppError("Object expected", 4005);

    const query: any = validateObj({
        from: [data.from, "ID"],
        to: [data.to, "ID"],
    });

    if(query.from === query.to) throw new AppError("Departure and Arrivial airports cannot be the same", 4005)

    if(!isObjSameSize(query, data)) throw new AppError("A new Route must include: from, to", 4005);

    return query;
}

export function validatePut(data: any){

    if(!isObject(data)) throw new AppError("Object expected", 4005);

    const parsedData: any = validatePartialObj({
        from: [data.from, "ID"],
        to: [data.to, "ID"]
    })

    if(isObjectEmpty(parsedData)) throw new AppError("Update not valid, please provide at least a new parameter", 4005);

    if(parsedData.from && parsedData.to && parsedData.from === parsedData.to) throw new AppError("Departure and Arrivial airports cannot be the same", 4005);

    return parsedData;
}

export function validateSearch(data: any){

    if(!isObject(data)) throw new AppError("Object expected", 4005);

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