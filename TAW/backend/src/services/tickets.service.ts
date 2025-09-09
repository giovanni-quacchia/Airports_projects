import mongoose from 'mongoose';
import { JOIN, matchAirport } from '../db/queries';
import Ti, {Ticket} from '../models/Ticket';


// TODO: aggiungere ricerca per airline

async function getAllTickets(query, flightId = "", airlineId = "") {
    Ti.validateSearch(query);
    
    let { minPrice = 0, maxPrice = 99999, minQuantity = 0, maxQuantity = 99999, type = /.*/, from = /.*/, to = /.*/, sortBy = "price", order = "asc"} = query

    const typeMatch = type ? { $regex: type, $options: "i" } : { $exists: true };

    const sortOrder = order === "asc" ? 1 : -1;

    const pipeline: any[] = []

    if(flightId){
        pipeline.push({
            $match: {flight: new mongoose.Types.ObjectId(flightId)}
        })
    }
    
    pipeline.push(
        // WHERE type, price, quantity, flight?
        { 
            $match: {
                "type": typeMatch,
                "price":{ $gte: minPrice, $lte: maxPrice},
                "quantity":{$gte: minQuantity, $lte: maxQuantity},
            }
        },
        ...JOIN("flights", "flight"),
    );

    if(airlineId){
        pipeline.push({
            $match: {"flight.airline": new mongoose.Types.ObjectId(airlineId)}
        })
    }
    
    pipeline.push(
        ...JOIN("routes", "flight.route"),
        ...JOIN("airports", "flight.route.from"),
        ...JOIN("airports", "flight.route.to"),
        ...JOIN("users", "flight.airline", "name code PIVA logo"),
        ...JOIN("airplanes", "flight.airplane"),

        matchAirport("flight.route.from", from),
        matchAirport("flight.route.to", to),

        { $sort: { [sortBy]: sortOrder } }        
    )

    return Ti.getModel().aggregate(pipeline);
}

async function getTicket(id: string){
    const ticket = await Ti.getModel().findById(id);
    if(!ticket) throw Error("ticket not found");
    return ticket.populate({
            path: "flight",
            populate: [
                {
                path: "route",
                populate: [
                    { path: "from" },
                    { path: "to" }
                ]
                },
                {
                path: "airline",
                select: "code PIVA name logo -__t"  // select only these fields
                }
            ]
        });
}

async function createTicket(Ticket: Partial<Ticket>){
    const ti = Ti.createTicket(Ticket);
    return ti.save();
}

async function deleteTicket(id: string){
    return Ti.getModel().findByIdAndDelete(id);
}

async function updateTicket(id: string, data: any){
    Ti.validate(data);
    return Ti.getModel().findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

export default {
    getAllTickets,
    getTicket,
    createTicket,
    deleteTicket,
    updateTicket
}