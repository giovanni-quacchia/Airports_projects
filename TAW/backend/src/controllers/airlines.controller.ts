import airlines from '../services/airlines.service'
import { manageErrors, printObject, validateObj } from '../utils/utils';
import { validateLogin } from '../utils/auth.utils';
import { validateNew, validatePut, validateSearch } from '../models/Airline';
import { AppError } from '../models/AppError';

export async function logIn(req, res, next) {
    try {
        const query = await validateLogin(req.body)
        const result = await airlines.logIn(query);
        res.json(result);
    } catch (err) {
        res.status(400).send(manageErrors(err, "Airline"));
    }
}

export async function getAllAirlines(req, res, next) {
    try {
        const query = validateSearch(req.query)
        const result = await airlines.getAllAirlines(req.user, query);
        res.json(result);
    } catch (err) {
        res.status(400).send(manageErrors(err, "Airline"));
    }
}

export async function getAirline(req, res, next){
    try {
        const {id} = req.params;
        validateObj({ id: [id, "ID"] });
        
        const result = await airlines.getAirline(id, req.user);
                
        res.json(result);
    } catch (err) {
        res.status(400).send(manageErrors(err, "Airline"));
    }
}

export async function createAirline(req, res, next){
    let parsedData: any = {}
    try {
        parsedData = validateNew(req.body); 
        const {airline, password} = await airlines.createAirline(parsedData);
        printObject("Airline created", {...parsedData, password})
        res.json({...airline, password});
    } catch (err) {
        res.status(400).send(manageErrors(err, "Airline"));
    }
}


export async function deleteAirline(req, res, next){
    try {
        const {id} = req.params;
        validateObj({ id: [id, "ID"] });

        const result = await airlines.deleteAirline(id);
        if(!result) throw new AppError("Airline not found", 4004);

        res.json({message: "Airline deleted", airline: result});
    } catch (err) {
        res.status(400).send(manageErrors(err, "Airline"));
    }
}

export async function updateAirline(req, res, next){
    try {
        const {id} = req.params;
        validateObj({ id: [id, "ID"] })

        const parsedData = validatePut(req.body);
        

        const result = await airlines.updateAirline(id, parsedData, req.user);
        if(!result) throw new AppError("Airline not found", 4004);

        res.json({message: "Airline updated", airline: result});
    } catch (err) {
        res.status(400).send(manageErrors(err, "Airline"));
    }
}

export default {
    getAllAirlines,
    getAirline,
    createAirline,
    deleteAirline,
    updateAirline,
    logIn
}