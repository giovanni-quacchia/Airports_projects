import mongoose from 'mongoose';
import { GROUPBY, JOIN, matchAirport } from '../db/queries';
import Airport from '../models/Airport';
import Ro, {Route} from '../models/Route';
import { AppError } from '../models/AppError';

// TODO: check req.user
async function getAllRoutes(query, airlineId = "", user: any = {}) {

    const parsedData: any = Ro.validateSearch(query);
    const { from = /.*/, to = /.*/, sortBy = "numPassengers", order = "desc" } = parsedData;
    const pipeline = [];
    const sortOrder = order === "asc" ? 1 : -1;


    if(airlineId){
        pipeline.push(
            ...JOIN("flights", "_id", undefined, "route", "flight"),
            {
                $match: {
                    "flight.airline": new mongoose.Types.ObjectId(airlineId)
                }
            },
            ...JOIN("tickets", "flight._id", "", "flight", "flight.ticket"),
            ...JOIN("purchases", "flight.ticket._id", "", "ticket", "flight.purchase"),            
            // ...JOIN("passengers", "flight.ticket._id", "", "ticket", "flight.passenger"),
        )
        // Only specific airline can view statistics of its flights
        if(user.isAdmin || user.id === airlineId){
            pipeline.push(
            ...GROUPBY("$_id", // group by route._id
                {  numPassengers: {$sum: "$flight.purchase.quantity"}, }
            ),
            { $sort: { [sortBy]: sortOrder } }
        ); 
        } else {
            pipeline.push(
                ...GROUPBY("$_id", // group by route._id
                    {}
                ),
            )
        }
        pipeline.push(
            // Group by flight._id but it keeps one tuple ticket,passenger, the $first it finds
            { $project: { "flight": 0 } },
        ); 
        
    }

    pipeline.push(
        ...JOIN("airports", "from", undefined, "_id"),
        matchAirport("from", from),
        ...JOIN("airports", "to", undefined, "_id"),
        matchAirport("to", to)
    )

    return Ro.getModel().aggregate(pipeline);
}

async function getRoute(id: string){
    return Ro.getModel().findById(id);
}

async function createRoute(data){   

    let newRoute: any =  {};

    // Start transaction
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        // Find airports
        const fromAirport = await Airport.getModel().findById(data.from).session(session);
        const toAirport = await Airport.getModel().findById(data.to).session(session);

        // Check that airports exist
        if(!fromAirport || !toAirport) throw new AppError("One or both airports ID do not exist", 4004);

        // Check if route already exists
        const query = {from: data.from, to: data.to}
        const exists = await Ro.getModel().findOne(query).session(session);
        if(exists) throw new AppError("Route already exists", 11000)

        newRoute = Ro.newRoute(query);
        await newRoute.save({session});

        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction(); // rollback
        throw error;
    } finally {
        session.endSession();
    }

    return newRoute;
}

async function deleteRoute(id: string){
    return Ro.getModel().findByIdAndDelete(id);
}

async function updateRoute(id: string, data: any){
    return Ro.getModel().findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

export default {
    getAllRoutes,
    getRoute,
    createRoute,
    deleteRoute,
    updateRoute
}