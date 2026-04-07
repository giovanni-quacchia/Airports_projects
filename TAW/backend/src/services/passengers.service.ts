import { JOIN, matchId } from '../db/queries';
import Pa, { newPassenger } from '../models/passenger';
import { AppError } from '../models/AppError';
import {getModel as getPassengerModel} from '../models/passenger';
import {getModel as getFlightModel} from '../models/flight';
import {getModel as getPurchaseModel} from '../models/Purchase';
import {getModel as getAirplaneModel} from '../models/airplane';
import purchasesService from './purchases.service';
import mongoose from 'mongoose';
import { checkSeat } from '../utils/utils';

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

    let limitSelect = false; // check for logged user
    if(flightId){

        // Only admin and specific airline of the flight can view all data
        const airlineId = (await getFlightModel().findById(flightId).select("airline"))?.airline;
        if(!airlineId) throw new AppError("Flight not found", 4004);

        // logged user can only view occupied seats
        if(!user.isAdmin && String(airlineId) !== String(user.id)){
            limitSelect = true;
        }

        pipeline.push(matchId("purchase.ticket.flight._id", flightId));

    } else if(purchaseId){

        // Only admin, specific airline of the flight or user owner of the purchase
        const purchase: any = (await purchasesService.getPurchase(purchaseId));

        const userId = String(purchase.user);
        const airlineId = String(purchase?.ticket?.flight?.airline);

        if(!airlineId) throw new AppError("Purchase ticket not found", 4004);
        if(!userId) throw new AppError("Purchase user not found", 4004);

        if(!user.isAdmin && airlineId !== user.id && userId !== user.id) throw new AppError("You are not allowed to perform this operation", 4003);

        pipeline.push(matchId("purchase._id", purchaseId));
    }

    // logged user can only view occupied seats
    if(limitSelect){
        pipeline.push({ $project: {seat: 1} }) // hide sensitive data
    }

    pipeline.push(
        { $sort: { [sortBy]: sortOrder } }
    )

    const result = await getPassengerModel().aggregate(pipeline);
    return result;
}


async function getPassenger(id: string, user){
    const res = await getPassengerModel().findById(id);
    if(!res) throw new AppError("Passenger not found", 4004);
    return res;
}

async function createPassenger(data, user){

    // Start transaction
    const session = await mongoose.startSession();
    
    try {
        session.startTransaction();

        // Get purchase
        const purchase: any = await await getPurchaseModel().findById(data.purchase).populate({path: "ticket", populate: "flight"}).session(session);
        if(!purchase) throw new AppError("Purchase not found", 4004);

        // Only admin or user owner of the purchase
        if(!user.isAdmin && String(purchase.user) !== user.id) throw new AppError("You are not allowed to perform this operation", 4005);

        // Check num of passengers already created < tickets purchased
        const passengersQnt = await getPassengerModel().countDocuments({purchase: new mongoose.Types.ObjectId(data.purchase)}).session(session);
        if(passengersQnt >= purchase.quantity) throw new AppError("Ticket quantity exceeded", 4005);

        // Check that ticket and flight still exist
        if(!purchase.ticket) throw new AppError("Ticket not found", 4004);
        if(!purchase.ticket.flight) throw new AppError("Flight not found", 4004);
        
        // Check airplane seats
        const airplaneId = purchase.ticket.flight.airplane;
        const airplane = await getAirplaneModel().findById(airplaneId).session(session);
        if(!airplane) throw new AppError("Airplane not found", 4004);

        // Check if seat exists
        if(!checkSeat(data.seat, airplane.letters, airplane.rows)) throw new AppError("Invalid seat", 4005);

        // Check if seat is already taken
        const flightId = purchase.ticket.flight._id;
        const isSeatTaken = await getAllpassengers({seat: data.seat}, flightId, "", {isAdmin: true})
        if(isSeatTaken.length > 0) throw new AppError("Seat already taken", 4005);

        // Create passenger
        const passenger = newPassenger(data);
        await passenger.save({session});
        await session.commitTransaction();

        return passenger

    } catch (error) {
        await session.abortTransaction(); // rollback
        throw error;
    } finally {
        session.endSession();
    }
}

// Only admin, specific airline or user owner of the purchase
async function deletePassenger(id: string, user){
    
    const session = await mongoose.startSession();
    
    try {
        session.startTransaction();
        
        // Find userId and airlineId
        const res: any = await getPassengerModel().findById(id)
            .populate({
                path: "purchase",
                populate: {
                    path: "ticket",
                    populate: {path: "flight"}
                }
            })
            .session(session);
        if(!res) throw new AppError("Passenger not found", 4004);

        const userId = String(res.purchase?.user);
        const airlineId = String(res.purchase?.ticket?.flight?.airline)

        if(!user.isAdmin && airlineId !== user.id && userId !== user.id) throw new AppError("You are not allowed to perform this operation", 4003);

        await res.deleteOne({session});
        await session.commitTransaction();
        return res;

    } catch (error) {
        await session.abortTransaction(); // rollback
        throw error;
    } finally {
        session.endSession();
    }
}

// Only admin, specific airline or user owner of the purchase
async function updatePassenger(id: string, data: any, user){
    const session = await mongoose.startSession();
    
    try {
        session.startTransaction();
        
        // Find userId and airlineId
        const res: any = await getPassengerModel().findById(id)
            .populate({
                path: "purchase",
                populate: {
                    path: "ticket",
                    populate: {
                        path: "flight",
                        populate: "airplane"
                    }
                }
            })
            .session(session);
        if(!res) throw new AppError("Passenger not found", 4004);

        const userId = String(res.purchase?.user);
        const airlineId = String(res.purchase?.ticket?.flight?.airline)
        
        if(!userId) throw new AppError("User who made the purchase not found", 4004);
        if(!airlineId) throw new AppError("Airline not found", 4004);

        if(!user.isAdmin && airlineId !== user.id && userId !== user.id) throw new AppError("You are not allowed to perform this operation", 4003);


        if(data.seat){
            const airplane = res.purchase?.ticket?.flight?.airplane;
            if(!airplane) throw new AppError("Airplane not found", 4004);

            // Check if new seat exists
            if(!checkSeat(data.seat, airplane.letters, airplane.rows)) throw new AppError("This seat does not exist", 4005);

            // Check if seat is already taken
            const flightId = res.purchase?.ticket?.flight?._id;
            const isSeatTaken = await getAllpassengers({seat: data.seat}, flightId, "", {isAdmin: true})
            if(isSeatTaken.length > 0) throw new AppError("Seat already taken", 4005);
        }

        const updated = await getPassengerModel().findByIdAndUpdate(id, data, {new: true, session})
        await session.commitTransaction();
        return updated;
    } catch (error) {
        await session.abortTransaction(); // rollback
        throw error;
    } finally {
        session.endSession();
    }
}

export default {
    getAllpassengers,
    getPassenger,
    createPassenger,
    deletePassenger,
    updatePassenger
}