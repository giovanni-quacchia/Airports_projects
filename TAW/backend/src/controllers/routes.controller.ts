import { validateNew } from '../models/route';
import routes from '../services/routes.service'
import { manageErrors, printObject } from '../utils/utils';

export async function getAllRoutes(req, res, next) {
    try {
        const {airlineId} = req.params
        const result = await routes.getAllRoutes(req.query, airlineId, req.user);
        res.json(result);
    } catch (err) {
        res.status(400).send(err.message);
    }
}

export async function getRoute(req, res, next){
    try {
        const {id} = req.params;
        const result = await routes.getRoute(id);
        res.json(result);
    } catch (err) {
        res.status(400).send(err.message);
    }
}

export async function createRoute(req, res, next){
    let parsedData: any = {}
    try {
        parsedData = validateNew(req.body);
        const result = await routes.createRoute(parsedData);
        printObject("Route created", parsedData)    
        res.json(result);
    } catch (err) {
        res.status(400).send(manageErrors(err, "Route", parsedData));
    }
}

export async function deleteRoute(req, res, next){
    try {
        const {id} = req.params;
        const result = await routes.deleteRoute(id);
        res.json(result);
    } catch (err) {
        res.status(400).send(err.message);
    }
}

export async function updateRoute(req, res, next){
    let parsedData: any = {}
    try {
        parsedData = validateNew(req.body);
        const {id} = req.params;
        const result = await routes.updateRoute(id, parsedData);
        res.json(result);
    } catch (err) {
        res.status(400).send(manageErrors(err, "Route", parsedData));
    }
}

export default {
    getAllRoutes,
    getRoute,
    createRoute,
    deleteRoute,
    updateRoute
}