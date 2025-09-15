import mongoose from 'mongoose';
import { JOIN } from '../db/queries';
import Pa from '../models/Passenger';
import Ticket from './tickets.service';
import { AppError } from '../models/AppError';


async function getAllpassengers(query, flightId = "", purchaseId = "", user) {
    Pa.validateSearch(query);

    const {sortBy = "seat", order = "asc"} = query;
    let { name = "", surname = "", CF = "", passportNumber = "", seat = "" } = query

    name = name ? { $regex: name, $options: "i" } : /.*/;
    surname = surname ? { $regex: surname, $options: "i" } : /.*/;
    CF = CF ? { $regex: CF, $options: "i" } : /.*/;
    passportNumber = passportNumber ? { $regex: passportNumber, $options: "i" } : /.*/;
    seat = seat ? { $regex: seat, $options: "i" } : /.*/;

    const sortOrder = order === "asc" ? 1 : -1;

    const pipeline: any[] = [

        { $match: {name: name, surname: surname, seat: seat }},

        ...JOIN("purchases", "purchase", "ticket user"),
        ...JOIN("tickets", "purchase.ticket", "flight type"),
        ...JOIN("flights", "purchase.ticket.flight", "airline"),
    ]

    if(query.CF) pipeline.push( { $match: {CF: CF}} )
    if(query.passportNumber) pipeline.push( { $match: {passportNumber: passportNumber}} )

    if(flightId){

        // Only admin and specific airline of the flight
        if(!user.isAdmin && user.id !== flightId) throw new AppError("You are not allowed to perform this operation", 4003);

        pipeline.push({
            $match: {
                "purchase.ticket.flight": new mongoose.Types.ObjectId(flightId),
            }
        })
    } else if(purchaseId){
        pipeline.push({
            $match: {
                "purchase._id": new mongoose.Types.ObjectId(purchaseId),
                $or: [
                    { "purchase.user" : user.isAdmin ? { $exists: true } : new mongoose.Types.ObjectId(user.id) },
                    { "purchase.ticket.flight.airline": user.isAdmin ? { $exists: true } : new mongoose.Types.ObjectId(user.id) }
                ]
            }
        })
    }

    pipeline.push(
        { $sort: { [sortBy]: sortOrder } }
    )

    const result = await Pa.getModel().aggregate(pipeline);

    // TODO: se airline o utente non autorizzato ricevono un array vuoto, come distingure da 
    // il caso in cui non ci sono passeggeri?

    return result;
}

// TODO: da finire da qui
async function getPassenger(id: string, user){
    return Pa.getModel().findById(id);
}

// Check ticket.qnt and update it and create new passenger
export async function createPassenger(data, user){

    const {ticket: ticketId} = data
    let res;

    // check ticket.qnt
    const ticket: any = await Ticket.getTicket(ticketId);
    if(ticket.quantity <= 0) throw Error("Tickets not available");

    // decrease ticket.qnt
    ticket.quantity -= 1;

    await ticket.save();

    // check seat
    // const p: any[] = await getAllpassengers({seat: data.seat}, String(ticket.flight._id));
    // if(p.length !== 0) throw Error("Seat already taken")

    // create new passenger
    res = Pa.createPassenger(data);
    return res.save();
}

async function deletePassenger(id: string, user){
    return Pa.getModel().findByIdAndDelete(id);
}

async function updatePassenger(id: string, data: any, user){
    return Pa.getModel().findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

export default {
    getAllpassengers,
    getPassenger,
    createPassenger,
    deletePassenger,
    updatePassenger
}