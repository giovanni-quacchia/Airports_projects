import passengers from '../services/passengers.service'

export async function getAllPassengers(req, res, next) {
    try {
        const {flightId} = req.params;
        const result = await passengers.getAllpassengers(req.query, flightId);
        res.json(result);
    } catch (err) {
        res.status(400).send(err.message);
    }
}

export async function getPassenger(req, res, next){
    try {
        const {id} = req.params;
        const result = await passengers.getPassenger(id);
        res.json(result);
    } catch (err) {
        res.status(400).send(err.message);
    }
}

export async function createPassenger(req, res, next){
    const ar = req.body
    try {
        const result = await passengers.createPassenger(ar);

        console.log("\npassenger created:");
        for(const value of Object.values(ar))
            console.log(`-${value}`);   
          
        res.json(result);
    } catch (err) {
        // duplicate error
        if (err.code === 11000)
            err.message = `passenger with code ${ar.code} already exists`;
        res.status(400).send(err.message);
    }
}

export async function deletePassenger(req, res, next){
    try {
        const {id} = req.params;
        const result = await passengers.deletePassenger(id);
        res.json(result);
    } catch (err) {
        res.status(400).send(err.message);
    }
}

export async function updatePassenger(req, res, next){
    const ar = req.body;
    try {
        const {id} = req.params;
        const result = await passengers.updatePassenger(id, ar);
        res.json(result);
    } catch (err) {
        res.status(400).send(err.message);
    }
}

export default {
    getAllPassengers,
    getPassenger,
    createPassenger,
    deletePassenger,
    updatePassenger
}