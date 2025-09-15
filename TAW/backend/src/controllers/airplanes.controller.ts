import airplanes from '../services/airplanes.service'
import { validateNew, validatePut } from '../models/Airplane';
import { manageErrors, printObject, validateObj } from '../utils/utils';

export async function getAllAirplanes(req, res, next) {
    try {
        const { airlineId = ""} = req.params
        if(airlineId) validateObj({id: [airlineId, "ID"]})

        const result = await airplanes.getAllAirplanes(airlineId);
        res.json(result);
    } catch (err) {
        res.status(400).send(manageErrors(err, "Airplane"));
    }
}

export async function getAirplane(req, res, next){
    try {
        const {id} = req.params;
        validateObj({ id: [id, "ID"] })

        const result = await airplanes.getAirplane(id);
        res.json(result);
    } catch (err) {
        res.status(400).send(manageErrors(err, "Airplane"));
    }
}

export async function createAirplane(req, res, next){
    let parsedData: any = {}
    try {
        parsedData = validateNew(req.body);
        const result = await airplanes.createAirplane(parsedData);
        printObject("Airplane created", parsedData)    
        res.json(result);
    } catch (err) {
        res.status(400).send(manageErrors(err, "Airplane"));
    }
}

export async function deleteAirplane(req, res, next){
    try {
        const {id} = req.params;
        validateObj({ id: [id, "ID"] })

        const result = await airplanes.deleteAirplane(id);
        res.json(result);
    } catch (err) {
        res.status(400).send(manageErrors(err, "Airplane"));
    }
}

export async function updateAirplane(req, res, next){
    let parsedData: any = {}
    try {
        const {id} = req.params;
        validateObj({ id: [id, "ID"] })

        parsedData = validatePut(req.body);

        const result = await airplanes.updateAirplane(id, parsedData);
        res.json(result);
    } catch (err) {
        res.status(400).send(manageErrors(err, "Airplane"));
    }
}

export default {
    getAllAirplanes,
    getAirplane,
    createAirplane,
    deleteAirplane,
    updateAirplane
}