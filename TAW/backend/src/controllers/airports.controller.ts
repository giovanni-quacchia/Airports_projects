import { validateNew, validatePut } from '../models/Airport';
import airports from '../services/airports.service'
import { manageErrors, printObject, validateObj } from '../utils/utils';

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
        validateObj({ id: [id, "ID"] })

        const result = await airports.getAirport(id);

        res.json(result);
    } catch (err) {
        res.status(400).send(err.message);
    }
}

export async function createAirport(req, res, next){
    let parsedData: any = {}
    try {
        parsedData = validateNew(req.body);
        const result = await airports.createAirport(parsedData);
        result.save();
        printObject("Airport created", parsedData);   
        res.json(result);
    } catch (err) {
        res.status(400).send(manageErrors(err, "Airport"));
    }
}

export async function deleteAirport(req, res, next){
    try {
        const {id} = req.params;
        validateObj({ id: [id, "ID"] })

        const result = await airports.deleteAirport(id);
        res.json(result);
    } catch (err) {
        res.status(400).send(manageErrors(err, "Airport"));
    }
}

export async function updateAirport(req, res, next){
    let parsedData: any = {}
    try {
        const {id} = req.params;
        validateObj({ id: [id, "ID"] })

        parsedData = validatePut(req.body);

        const result = await airports.updateAirport(id, parsedData);
        res.json(result);
    } catch (err) {
        res.status(400).send(manageErrors(err, "Airport"));
    }
}

export default {
    getAllAirports,
    getAirport,
    createAirport,
    deleteAirport,
    updateAirport
}