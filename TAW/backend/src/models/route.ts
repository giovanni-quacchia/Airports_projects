import mongoose = require('mongoose');
import { Airport } from './Airport';

// Interface
export interface Route{
    from: Airport,
    to: Airport
}

// Schema

const RouteSchema = new mongoose.Schema<Route>({
    from: {type: mongoose.Schema.ObjectId, ref: 'Airport', required: true}, // FK
    to: {type: mongoose.Schema.ObjectId, ref: 'Airport', required: true} // FK
});

// Model

let routeModel: mongoose.Model<Route>;
export function getModel(): mongoose.Model<Route> {
    if(!routeModel) routeModel = mongoose.model<Route>('Route', RouteSchema);
    return routeModel;
}

export function newRoute(data): Route {
    const _routeModel = getModel();
    const route = new _routeModel(data);
    return route;
}