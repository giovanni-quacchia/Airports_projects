import airports from '../services/airports.service'
import { manageErrors, printObject } from '../utils/utils';

export async function getAllAirports(req, res, next) {
    try {
        const result = await airports.getAllAirports(req.query);
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
        result.save();
        printObject("New Airport", ar);   
        res.json(result);
    } catch (err) {
        res.status(400).send(manageErrors(err, "Airport", ar));
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
        res.status(400).send(manageErrors(err, "Airport", ar));
    }
}

export default {
    getAllAirports,
    getAirport,
    createAirport,
    deleteAirport,
    updateAirport
}