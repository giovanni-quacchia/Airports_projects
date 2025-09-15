import mongoose from 'mongoose';
import { JOIN } from '../db/queries';
import Pa from '../models/Passenger';
import Ticket from './tickets.service';


async function getAllpassengers(query, flightId?: string) {
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

        ...JOIN("tickets", "ticket"),
    ]

    if(query.CF) pipeline.push( { $match: {CF: CF}} )
    if(query.passportNumber) pipeline.push( { $match: {passportNumber: passportNumber}} )

    if(flightId){
        pipeline.push({
            $match: {"ticket.flight": new mongoose.Types.ObjectId(flightId)}
        })
    }

    pipeline.push(
        { $sort: { [sortBy]: sortOrder } }
    )

    return Pa.getModel().aggregate(pipeline);
}

async function getPassenger(id: string){
    return Pa.getModel().findById(id);
}

// Check ticket.qnt and update it and create new passenger
export async function createPassenger(passenger){

    Pa.validateInput(passenger)

    const {ticket: ticketId} = passenger
    let res;

    // check ticket.qnt
    const ticket: any = await Ticket.getTicket(ticketId);
    if(ticket.quantity <= 0) throw Error("Tickets not available");

    // decrease ticket.qnt
    ticket.quantity -= 1;

    await ticket.save();

    // check seat
    const p: any[] = await getAllpassengers({seat: passenger.seat}, String(ticket.flight._id));
    if(p.length !== 0) throw Error("Seat already taken")

    // create new passenger
    res = Pa.createPassenger(passenger);
    return res.save();
}

async function deletePassenger(id: string){
    return Pa.getModel().findByIdAndDelete(id);
}

async function updatePassenger(id: string, data: any){
    Pa.validate(data);
    return Pa.getModel().findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

export default {
    getAllpassengers,
    getPassenger,
    createPassenger,
    deletePassenger,
    updatePassenger
}