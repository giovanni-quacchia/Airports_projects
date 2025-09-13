import Tickets from '../services/tickets.service'
import { manageErrors, printObject, validateObj } from '../utils/utils';
import { validateNew, validatePut, validateSearch } from '../models/Ticket';

export async function getAllTickets(req, res, next) {
    try {
        const {flightId, airlineId} = req.params;

        if(flightId) validateObj({id: [flightId, "ID"]});
        if(airlineId) validateObj({id: [airlineId, "ID"]});

        const query: any = validateSearch(req.query);
        const result = await Tickets.getAllTickets(query, flightId, airlineId);
        res.json(result);
    } catch (err) {
        res.status(400).send(manageErrors(err, "Ticket"));
    }
}

export async function getTicket(req, res, next){
    try {
        const {id} = req.params;
        validateObj({ id: [id, "ID"] })

        const result = await Tickets.getTicket(id);

        res.json(result);
    } catch (err) {
        res.status(400).send(manageErrors(err, "Ticket"));
    }
}

export async function createTicket(req, res, next){
    let parsedData: any = {}
    try {
        parsedData = validateNew(req.body);
        const result = await Tickets.createTicket(parsedData, req.user);
        printObject("Ticket created", parsedData);
        res.json(result);
    } catch (err) {
        res.status(400).send(manageErrors(err, "Ticket"));
    }
}

export async function deleteTicket(req, res, next){
    try {
        const {id} = req.params;
        validateObj({ id: [id, "ID"] })

        const result = await Tickets.deleteTicket(id, req.user);

        res.json(result);
    } catch (err) {
        res.status(400).send(manageErrors(err, "Ticket"));
    }
}

export async function updateTicket(req, res, next){
    try {
        const {id} = req.params;
        validateObj({ id: [id, "ID"] })

        const parsedData = validatePut(req.body)

        const result = await Tickets.updateTicket(id, parsedData, req.user);
        res.json(result);
    } catch (err) {
        res.status(400).send(manageErrors(err, "Ticket"));
    }
}

export default {
    getAllTickets,
    getTicket,
    createTicket,
    deleteTicket,
    updateTicket
}