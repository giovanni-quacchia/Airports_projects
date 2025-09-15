import { validateNew, validatePut } from '../models/Route';
import routes from '../services/routes.service'
import { manageErrors, printObject, validateObj } from '../utils/utils';

export async function getAllRoutes(req, res, next) {
    try {
        const {airlineId = ""} = req.params;
        if(airlineId) validateObj({id: [airlineId, "ID"]})
            
        const result = await routes.getAllRoutes(req.query, airlineId, req.user);
        
        res.json(result);
    } catch (err) {
        res.status(400).send(manageErrors(err, "Route"));
    }
}

export async function getRoute(req, res, next){
    try {
        const {id} = req.params;
        validateObj({ id: [id, "ID"] })

        const result = await routes.getRoute(id);

        res.json(result);
    } catch (err) {
        res.status(400).send(manageErrors(err, "Route"));
    }
}

export async function createRoute(req, res, next){
    let parsedData: any = {}
    try {
        parsedData = validateNew(req.body);
        const result = await routes.createRoute(parsedData);
        result.save();
        printObject("Route created", parsedData)    
        res.json(result);
    } catch (err) {
        res.status(400).send(manageErrors(err, "Route"));
    }
}

export async function deleteRoute(req, res, next){
    try {
        const {id} = req.params;
        validateObj({ id: [id, "ID"] })

        const result = await routes.deleteRoute(id);

        res.json(result);
    } catch (err) {
        res.status(400).send(manageErrors(err, "Route"));
    }
}

export async function updateRoute(req, res, next){
    let parsedData: any = {}
    try {
        const {id} = req.params;
        validateObj({ id: [id, "ID"] })

        parsedData = validatePut(req.body);
        
        const result = await routes.updateRoute(id, parsedData);
        res.json(result);
    } catch (err) {
        res.status(400).send(manageErrors(err, "Route"));
    }
}

export default {
    getAllRoutes,
    getRoute,
    createRoute,
    deleteRoute,
    updateRoute
}