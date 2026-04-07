import { AppError } from '../models/AppError';
import { validateNew, validatePut, validateSearch } from '../models/passenger';
import passengers from '../services/passengers.service'
import { manageErrors, printObject, validateObj } from '../utils/utils';

export async function getAllPassengers(req, res, next) {
    try {
        const {flightId, purchaseId} = req.params;
        if(flightId) validateObj({id: [flightId, "ID"]})
        if(purchaseId) validateObj({id: [purchaseId, "ID"]})   

        const query = validateSearch(req.query);

        const result = await passengers.getAllpassengers(query, flightId, purchaseId, req.user);
        res.json(result);
    } catch (err) {
        res.status(400).send(manageErrors(err, "Passenger"));
    }
}

export async function getPassenger(req, res, next){
    try {
        const {id} = req.params;
        validateObj({ id: [id, "ID"] })
        
        const result = await passengers.getPassenger(id, req.user);

        res.json(result);
    } catch (err) {
        res.status(400).send(manageErrors(err, "Passenger"));
    }
}

export async function createPassenger(req, res, next){
    let parsedData: any = {}
    try {
        parsedData = validateNew(req.body);
        const result = await passengers.createPassenger(parsedData, req.user);
        printObject("Passenger created", parsedData)
        res.json(result);
    } catch (err) {
        res.status(400).send(manageErrors(err, "Passenger"));
    }
}

export async function deletePassenger(req, res, next){
    try {
        const {id} = req.params;
        validateObj({ id: [id, "ID"] });

        const result = await passengers.deletePassenger(id, req.user);
        res.json(result);
    } catch (err) {
        res.status(400).send(manageErrors(err, "Passenger"));
    }
}

export async function updatePassenger(req, res, next){
    try {
        const {id} = req.params;
        validateObj({ id: [id, "ID"] })

        const parsedData = validatePut(req.body);

        const result = await passengers.updatePassenger(id, parsedData, req.user);
        res.json(result);
    } catch (err) {
        res.status(400).send(manageErrors(err, "Passenger"));
    }
}

export default {
    getAllPassengers,
    getPassenger,
    createPassenger,
    deletePassenger,
    updatePassenger
}