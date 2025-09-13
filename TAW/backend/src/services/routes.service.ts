import mongoose from 'mongoose';
import { GROUPBY, JOIN, matchAirport } from '../db/queries';
import Ro, {Route} from '../models/route';
import Airport from '../models/Airport';

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
    const parsedData = Ro.validateNew(data);
   
    // Find airports
    const fromAirport = await Airport.getModel().findOne({code: data.from});
    const toAirport = await Airport.getModel().findOne({code: data.to});

    if(!fromAirport || !toAirport) throw Error("One or both airports ID do not exist");

    const query = {from: String(fromAirport._id), to: String(toAirport._id)}

    // Check if route already exists
    const exists = await Ro.getModel().findOne(query)
    if(exists) throw Error("Route already exists")

    const ro = Ro.createRoute(query);
    return ro;
}

async function deleteRoute(id: string){
    return Ro.getModel().findByIdAndDelete(id);
}

async function updateRoute(id: string, data: any){
    Ro.validate(data);
    return Ro.getModel().findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

export default {
    getAllRoutes,
    getRoute,
    createRoute,
    deleteRoute,
    updateRoute
}