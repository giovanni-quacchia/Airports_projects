import routes from '../services/routes.service'

export async function getAllRoutes(req, res, next) {
    try {
        const result = await routes.getAllRoutes();
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
    const ar = req.body
    try {
        const result = await routes.createRoute(ar);

        console.log("\nRoute created:");
        for(const value of Object.values(ar))
            console.log(`-${value}`);     
        res.json(result);
    } catch (err) {
        // duplicate error
        if (err.code === 11000)
            err.message = `Route with code ${ar.code} already exists`;
        res.status(400).send(err.message);
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
    const ar = req.body;
    try {
        const {id} = req.params;
        const result = await routes.updateRoute(id, ar);
        res.json(result);
    } catch (err) {
        res.status(400).send(err.message);
    }
}

export default {
    getAllRoutes,
    getRoute,
    createRoute,
    deleteRoute,
    updateRoute
}