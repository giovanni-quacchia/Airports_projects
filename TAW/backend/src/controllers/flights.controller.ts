import mongoose from 'mongoose';
import flights from '../services/flights.service'
import { manageErrors, printObject, validateObj } from '../utils/utils';
import { validateNew, validatePut, validateSearch } from '../models/Flight';

export async function getAllFlights(req, res, next) {
    try {
        const { airlineId } = req.params
        if(airlineId) validateObj({id: [airlineId, "ID"]})
        
        const query: any = validateSearch(req.query);
        const result = await flights.getAllFlights(query, airlineId, req.user);
        
        res.json(result);
    } catch (err) {
        res.status(400).send(manageErrors(err, "Flight"));
    }
}

export async function getFlight(req, res, next){
    try {
        const {id} = req.params;
        validateObj({ id: [id, "ID"] })

        const result = await flights.getFlight(id);

        res.json(result);
    } catch (err) {
        res.status(400).send(manageErrors(err, "Flight"));
    }
}

export async function createFlight(req, res, next){
    let parsedData: any = {}
    try {
        parsedData = validateNew(req.body);
        const result = await flights.createFlight(parsedData);
        printObject("Flight created", parsedData)  
        res.json(result);
    } catch (err) {
        res.status(400).send(manageErrors(err, "Flight"));
    }
}

export async function deleteFlight(req, res, next){
    try {
        const {id} = req.params;
        validateObj({ id: [id, "ID"] });

        const result = await flights.deleteFlight(id, req.user);

        res.json(result);
    } catch (err) {
        res.status(400).send(manageErrors(err, "Flight"));
    }
}

export async function updateFlight(req, res, next){
    try {
        const {id} = req.params;
        validateObj({ id: [id, "ID"] })

        const parsedData = validatePut(req.body)

        const result = await flights.updateFlight(id, parsedData, req.user);
        res.json(result);
    } catch (err) {
        res.status(400).send(manageErrors(err, "Flight"));
    }
}

export default {
    getAllFlights,
    getFlight,
    createFlight,
    deleteFlight,
    updateFlight
}