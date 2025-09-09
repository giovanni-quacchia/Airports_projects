import Tickets from '../services/tickets.service'

export async function getAllTickets(req, res, next) {
    try {
        const {flightId} = req.params;
        const result = await Tickets.getAllTickets(req.query, flightId);
        res.json(result);
    } catch (err) {
        res.status(400).send(err.message);
    }
}

export async function getTicket(req, res, next){
    try {
        const {id} = req.params;
        const result = await Tickets.getTicket(id);
        res.json(result);
    } catch (err) {
        res.status(400).send(err.message);
    }
}

export async function createTicket(req, res, next){
    const ar = req.body
    try {
        const result = await Tickets.createTicket(ar);

        console.log("\nTicket created:");
        for(const value of Object.values(ar))
            console.log(`-${value}`);     
        res.json(result);
    } catch (err) {
        // duplicate error
        if (err.code === 11000)
            err.message = `Ticket with code ${ar.code} already exists`;
        res.status(400).send(err.message);
    }
}

export async function deleteTicket(req, res, next){
    try {
        const {id} = req.params;
        const result = await Tickets.deleteTicket(id);
        res.json(result);
    } catch (err) {
        res.status(400).send(err.message);
    }
}

export async function updateTicket(req, res, next){
    const ar = req.body;
    try {
        const {id} = req.params;
        const result = await Tickets.updateTicket(id, ar);
        res.json(result);
    } catch (err) {
        res.status(400).send(err.message);
    }
}

export default {
    getAllTickets,
    getTicket,
    createTicket,
    deleteTicket,
    updateTicket
}