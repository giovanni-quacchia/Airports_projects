import mongoose from 'mongoose';
import flights from '../services/flights.service'

export async function getAllFlights(req, res, next) {
    try {
        const { airlineId } = req.params
        if(airlineId && !mongoose.Types.ObjectId.isValid(airlineId)) throw Error("Airline id not valid");
        const result = await flights.getAllFlights(req.query, airlineId, req.user);
        res.json(result);
    } catch (err) {
        res.status(400).send(err.message);
    }
}

export async function getFlight(req, res, next){
    try {
        const {id} = req.params;
        const result = await flights.getFlight(id);
        res.json(result);
    } catch (err) {
        res.status(400).send(err.message);
    }
}

export async function createFlight(req, res, next){
    const ar = req.body
    try {
        const result = await flights.createFlight(ar);
        result.save();
        console.log("\nFlight created:");
        for(const value of Object.values(ar))
            console.log(`-${value}`);     
        res.json(result);
    } catch (err) {
        // duplicate error
        if (err.code === 11000)
            err.message = `Flight with code ${ar.code} already exists`;
        res.status(400).send(err.message);
    }
}

export async function deleteFlight(req, res, next){
    try {
        const {id} = req.params;
        const result = await flights.deleteFlight(id);
        res.json(result);
    } catch (err) {
        res.status(400).send(err.message);
    }
}

export async function updateFlight(req, res, next){
    const ar = req.body;
    try {
        const {id} = req.params;
        const result = await flights.updateFlight(id, ar);
        res.json(result);
    } catch (err) {
        res.status(400).send(err.message);
    }
}

export default {
    getAllFlights,
    getFlight,
    createFlight,
    deleteFlight,
    updateFlight
}