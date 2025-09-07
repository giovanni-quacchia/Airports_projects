import airlines from '../services/airlines.service'

export async function getAllAirlines(req, res, next) {
    try {
        const result = await airlines.getAllAirlines(req.query);
        res.json(result);
    } catch (err) {
        res.status(400).send(err.message);
    }
}

export async function getAirline(req, res, next){
    try {
        const {id} = req.params;
        const result = await airlines.getAirline(id);
        res.json(result);
    } catch (err) {
        res.status(400).send(err.message);
    }
}

export async function createAirline(req, res, next){
    const ar = req.body
    try {
        const [result, pw] = await airlines.createAirline(ar);

        console.log("\nAirline created:");
        console.log(`-${ar.PIVA}\n-${ar.name}\n-${ar.mail}:${pw}\n`);
        
        res.json(result);
    } catch (err) {
        // duplicate error
        if (err.code === 11000)
            err.message = `Airline already exists`;
        res.status(400).send(err.message);
    }
}

export async function deleteAirline(req, res, next){
    try {
        const {id} = req.params;
        const result = await airlines.deleteAirline(id);
        res.json(result);
    } catch (err) {
        res.status(400).send(err.message);
    }
}

export async function updateAirline(req, res, next){
    try {
        const {id} = req.params;
        const result = await airlines.updateAirline(id, req.body);
        res.json(result);
    } catch (err) {
        res.status(400).send(err.message);
    }
}

export default {
    getAllAirlines,
    getAirline,
    createAirline,
    deleteAirline,
    updateAirline
}