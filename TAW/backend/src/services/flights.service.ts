import mongoose from 'mongoose';
import { JOIN, matchAirlines, matchAirport, matchDate } from '../db/queries';
import Fl, {Flight} from '../models/flight';

// Direct Flights

//TODO: aggiungere statistics: solo per singola airline?
export async function getAllFlights(data, airlineId = ""){
    const query: any = Fl.validateSearch(data);
    let { from, to, fromDate = "", toDate = "", airline, sortBy = "departure", order = "asc", code} = query;

    airline = airline ? { $regex: airline, $options: "i" } : /.*/;
    code = code ? { $regex: code, $options: "i" } : /.*/;

    const sortOrder = order === "asc" ? 1 : -1;

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

        { $sort: { [sortBy]: sortOrder as 1 | -1 } } // type assertion: tells the compiler to consider the object as another type
    );

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
            select: "code PIVA name logo -__t"
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