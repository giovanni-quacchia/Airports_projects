import mongoose from 'mongoose';
import { GROUPBY, JOIN, matchAirport } from '../db/queries';
import Ro, {Route} from '../models/Route';
import Airport from '../models/Airport';
import { AppError } from '../models/AppError';

// TODO: check req.user
async function getAllRoutes(query, airlineId = "", user: any = {}) {

    const parsedData: any = Ro.validateSearch(query);
    const { from = /.*/, to = /.*/ } = parsedData;
    const pipeline = []

    if(airlineId){
        pipeline.push(
            ...JOIN("flights", "_id", undefined, "route", "flight"),
            {
                $match: {
                    "flight.airline": new mongoose.Types.ObjectId(airlineId)
                }
            },
            ...JOIN("tickets", "flight._id", "", "flight", "flight.ticket"),
            ...JOIN("passengers", "flight.ticket._id", "", "ticket", "flight.passenger"),
                    
            ...GROUPBY("$_id",{ // group by route._id
                numPassengers: {$sum: 1},
            }
            ),
            // Group by flight._id but it keeps one tuple ticket,passenger, the $first it finds
            { $project: { "flight": 0 } },
        )
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

        // Check from != to
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