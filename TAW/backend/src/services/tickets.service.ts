import mongoose from 'mongoose';
import { JOIN, matchAirport } from '../db/queries';
import Ti, {Ticket} from '../models/Ticket';
import { AppError } from '../models/AppError';
import {getModel as getFlightModel} from '../models/Flight'
import {getModel as getPassengerModel} from '../models/Passenger'

async function getAllTickets(query, flightId = "", airlineId = "") {
    
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
        ...JOIN("airlines", "flight.airline", "name code PIVA logo"),
        ...JOIN("airplanes", "flight.airplane"),

        matchAirport("flight.route.from", from),
        matchAirport("flight.route.to", to),

        { $sort: { [sortBy]: sortOrder } }        
    )
    return Ti.getModel().aggregate(pipeline);
}

async function getTicket(id: string){
    const ticket = await Ti.getModel().findById(id)
    .populate({
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
            select: "code PIVA name logo"  // select only these fields
            }
        ]
    });
    if(!ticket) throw new AppError("Ticket not found", 4004);
    return ticket
}

async function createTicket(data, user){

    // Start transaction
    const session = await mongoose.startSession();
    
    try {
        session.startTransaction();

        // check flight exists
        const flight: any = await getFlightModel().findById(data.flight).session(session);
        if(!flight) throw new AppError("Flight does not exist", 4005);
        
        // check if flight.airline is user.id
        if(!user.isAdmin && String(flight.airline) !== user.id) throw new AppError("Access denied: this flight belongs to another airline", 4005);

        const newTicket = Ti.newTicket(data);
        await newTicket.save({session});

        await session.commitTransaction();

        return newTicket;
    } catch (error) {
        await session.abortTransaction(); // rollback
        throw error;
    } finally {
        session.endSession();
    }
}

async function deleteTicket(id: string, user){

    let res = {};

    // Start transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {

        // Find ticket
        const ticket = await Ti.getModel().findById(id).session(session);
        if(!ticket) throw new AppError("Ticket not found", 4004);

        // Check flight.airline === user.id
        const flight: any = await Ti.getModel().findById(id).session(session);
        if(!user.isAdmin && String(flight.airline) !== user.id) throw new AppError("Access denied: this ticket belongs to another airline", 4005);

        // Check if passenger exists for the ticket
        const passenger: any = await getPassengerModel().findOne({ticket: new mongoose.Types.ObjectId(id)}).session(session);
        if(passenger) throw new AppError("Ticket is in use by passengers", 4005);

        res = await ticket.deleteOne({session});
        await session.commitTransaction();
        return res;
    } catch (error) {
        await session.abortTransaction(); // rollback
        throw error;
    } finally {
        session.endSession();
    }
}

async function updateTicket(id: string, data: any, user){

    // Start transaction
    const session = await mongoose.startSession();

    try {
        session.startTransaction();
        
        // Find ticket
        const ticket = await Ti.getModel().findById(id).session(session);
        if(!ticket) throw new AppError("Ticket not found", 4004);

        // Find flight
        const flight = await getFlightModel().findById(ticket.flight).session(session);
        
        // Only specific airline or admin can update
        if(!user.isAdmin && String(flight.airline) !== user.id) throw new AppError("Ticket modifications are not allowed", 4005)

        // check new flight if no admin
        if(!user.isAdmin && data.flight){
            const newFlight = await getFlightModel().findById(data.flight).session(session);
            if(String(newFlight.airline) !== user.id) throw new AppError("The new flight belongs to another airline", 4005)
        }

        const newTicket = await Ti.getModel().findByIdAndUpdate(id, data, {new: true, runValidators: true, session})
        
        await session.commitTransaction();
        return newTicket;

    } catch (error) {
        await session.abortTransaction(); // rollback
        throw error;
    } finally {
        await session.endSession();
    }
}

export default {
    getAllTickets,
    getTicket,
    createTicket,
    deleteTicket,
    updateTicket
}