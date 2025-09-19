import mongoose from 'mongoose';
import { GROUPBY, JOIN, matchAirlines, matchAirport, matchDate, SORT } from '../db/queries';
import Fl from '../models/Flight';
import { CheckStatisticsReq } from '../utils/flight.utils';
import {getModel as getRouteModel} from'../models/Route';
import {getModel as getAirlineModel} from'../models/Airline';
import {getModel as getAirplaneModel} from'../models/Airplane';
import { AppError } from '../models/AppError';

// Direct Flights
export async function getAllFlights(query, airlineId = "", user: any = {}){

    let { from, to, fromDate = "", toDate = "", airline, sortBy = "departure", order = "asc", code, statistics = false} = query;

    airline = airline ? { $regex: airline, $options: "i" } : /.*/;
    code = code ? { $regex: code, $options: "i" } : /.*/;

    const pipeline: any[] = [];

    if(airlineId){
        pipeline.push(
            { $match: {airline: new mongoose.Types.ObjectId(airlineId)}}
        )
    }

    pipeline.push(

        { $match: {"code": code} },

        matchDate("departure", fromDate, toDate),

        ...JOIN("routes", "route"),

        ...JOIN("airports", "route.from"),

        matchAirport("route.from", from),

        ...JOIN("airports", "route.to"),

        matchAirport("route.to", to),

        ...JOIN("airlines", "airline", "code PIVA name logo"),

        matchAirlines(["airline"], airline),

        ...JOIN("airplanes", "airplane"),
    );

    // STATISTICS
    if (CheckStatisticsReq(user, airlineId, statistics)){
        pipeline.push(
            ...JOIN("tickets", "_id", "flight price", "flight", "ticket"),
            ...JOIN("purchases", "ticket._id", "price quantity", "ticket", "purchase"),
        
            ...GROUPBY("$_id",{ 
                numPassengers: {$sum: "$purchase.quantity"},
                totRevenue: { $sum: "$purchase.price" }
            }
            ),
            // Group by flight._id but it keeps one tuple ticket,passenger, the $first it finds
            { $project: { "ticket": 0, "purchase": 0 } },
        );
    }

    pipeline.push( SORT(sortBy, order) );

    return Fl.getModel().aggregate(pipeline)
    // return Fl.getModel().find();
}

async function getFlight(id: string){
    const flight = await Fl.getModel().findById(id)
        .populate({
            path: "route",
            populate: [
            { path: "from" },
            { path: "to" }
            ]
        })
        .populate({
            path: "airline",
            select: "code PIVA name logo"
        })
        .populate("airplane");
    if(!flight) throw new AppError("Flight not found", 4004);
    return flight;
}

async function createFlight(data){

    // Start transaction
    const session = await mongoose.startSession();
    
    try {
        session.startTransaction();

        // check route exists
        const route: any = await getRouteModel().findById(data.route).session(session);
        if(!route) throw new AppError("Route does not exist", 4005);

        // check airline
        const airline: any = await getAirlineModel().findById(data.airline).session(session);
        if(!airline) throw new AppError("Airline does not exist", 4005);

        // check airplane
        const airplane: any = await getAirplaneModel().findById(data.airplane).session(session);
        if(!airplane) throw new AppError("Airplane does not exist", 4005);

        // check airplane belong to airline
        if(!airline._id.equals(airplane.airline)) throw new AppError("This airplane belongs to another airline", 4005);

        // check if airplane is assigned to the route
        //if(!route._id.equals(airplane.route)) throw new AppError("This airplane is not assigned to the specified route", 4005)

        const newFlight = Fl.newFlight(data);
        await newFlight.save({session});

        await session.commitTransaction();

        return newFlight;
    } catch (error) {
        await session.abortTransaction(); // rollback
        throw error;
    } finally {
        session.endSession();
    }
}

async function deleteFlight(id: string, user){

    let res = {};

    // Start transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {

        // Find flight
        const flight = await Fl.getModel().findById(id).session(session);
        if(!flight) throw new AppError("Flight not found", 4004);

        // Only specific airline or admin can delete
        if(!user.isAdmin && String(flight.airline) !== user.id) throw new AppError("Flight modifications are not allowed", 4005)
        
        res = await flight.deleteOne({session});

        await session.commitTransaction();
        return res;
    } catch (error) {
        await session.abortTransaction(); // rollback
        throw error;
    } finally {
        session.endSession();
    }
}

async function updateFlight(id: string, data: any, user){

    // Start transaction
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        // Find flight
        const flight = await Fl.getModel().findById(id).session(session);
        if(!flight) throw new AppError("Flight not found", 4004);

        // Only specific airline or admin can update
        if(!user.isAdmin && String(flight.airline) !== user.id) throw new AppError("Flight modifications are not allowed", 4005)

        const newFlight = await Fl.getModel().findByIdAndUpdate(id, data, {new: true, runValidators: true, session})

        // check route exists
        const route: any = await getRouteModel().findById(newFlight.route).session(session);
        if(!route) throw new AppError("Route does not exist", 4005);

        // check airline
        const airline: any = await getAirlineModel().findById(newFlight.airline).session(session);
        if(!airline) throw new AppError("Airline does not exist", 4005);

        // check airplane
        const airplane: any = await getAirplaneModel().findById(newFlight.airplane).session(session);
        if(!airplane) throw new AppError("Airplane does not exist", 4005);

        // check airplane belong to airline
        if(!airline._id.equals(airplane.airline)) throw new AppError("This airplane belongs to another airline", 4005);

        // check if airplane is assigned to the route
        //if(!route._id.equals(airplane.route)) throw new AppError("This airplane is not assigned to the specified route", 4005)

        await session.commitTransaction();
        return newFlight;

    } catch (error) {
        await session.abortTransaction(); // rollback
        throw error;
    } finally {
        await session.endSession();
    }
}

export default {
    getAllFlights,
    getFlight,
    createFlight,
    deleteFlight,
    updateFlight
}