import airports from '../services/airports.service'

export async function getAllAirports(req, res, next) {
    try {
        const result = await airports.getAllAirports();
        res.json(result);
    } catch (err) {
        res.status(400).send(err.message);
    }
}

export async function getAirport(req, res, next){
    try {
        const {id} = req.params;
        const result = await airports.getAirport(id);
        res.json(result);
    } catch (err) {
        res.status(400).send(err.message);
    }
}

export async function createAirport(req, res, next){
    const ar = req.body
    try {
        const result = await airports.createAirport(ar);

        console.log("\nAirport created:");
        for(const value of Object.values(ar))
            console.log(`-${value}`);     
        res.json(result);
    } catch (err) {
        // duplicate error
        if (err.code === 11000)
            err.message = `Airport with code ${ar.code} already exists`;
        res.status(400).send(err.message);
    }
}

export async function deleteAirport(req, res, next){
    try {
        const {id} = req.params;
        const result = await airports.deleteAirport(id);
        res.json(result);
    } catch (err) {
        res.status(400).send(err.message);
    }
}

export async function updateAirport(req, res, next){
    const ar = req.body;
    try {
        const {id} = req.params;
        const result = await airports.updateAirport(id, ar);
        res.json(result);
    } catch (err) {
        res.status(400).send(err.message);
    }
}

export default {
    getAllAirports,
    getAirport,
    createAirport,
    deleteAirport,
    updateAirport
}