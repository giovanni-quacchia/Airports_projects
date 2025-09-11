import mongoose from 'mongoose';
import { GROUPBY, JOIN, matchAirlines, matchAirport, matchDate, SORT } from '../db/queries';
import Fl, {Flight} from '../models/flight';
import { CheckStatisticsReq } from '../utils/flight.utils';

// Direct Flights

//TODO: aggiungere statistics: solo per singola airline?
export async function getAllFlights(data, airlineId = "", user: any = {}){
    
    const query: any = Fl.validateSearch(data);

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
            ...JOIN("passengers", "ticket._id", "ticket", "ticket", "passenger"),
        
            ...GROUPBY("$_id",{ 
                numPassengers: {$sum: 1},
                totRevenue: { $sum: "$ticket.price" }
            }
            ),
            // Group by flight._id but it keeps one tuple ticket,passenger, the $first it finds
            { $project: { "ticket": 0, "passenger": 0 } },
        );
    }

    pipeline.push( SORT(sortBy, order) );

    return Fl.getModel().aggregate(pipeline)
}

async function getFlight(id: string){
    return Fl.getModel().findById(id)
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
        });
}

async function createFlight(flight: Partial<Flight>){
    const fl = Fl.createFlight(flight);
    return fl;
}

async function deleteFlight(id: string){
    return Fl.getModel().findByIdAndDelete(id);
}

async function updateFlight(id: string, data: any){
    Fl.validate(data);
    return Fl.getModel().findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

export default {
    getAllFlights,
    getFlight,
    createFlight,
    deleteFlight,
    updateFlight
}