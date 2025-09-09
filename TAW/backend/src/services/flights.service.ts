import { JOIN, matchAirlines, matchAirport, matchDate } from '../db/queries';
import Fl, {Flight} from '../models/flight';

// Direct Flights
export async function getAllFlights(query){
    Fl.validateSearch(query);
    let { from, to, fromDate = "", toDate = "", airline, sortBy = "departure", order = "asc"} = query;

    from = from ? { $regex: from, $options: "i" } : /.*/;
    to = to ? { $regex: to, $options: "i" } : /.*/;
    airline = airline ? { $regex: airline, $options: "i" } : /.*/;

    const sortOrder = order === "asc" ? 1 : -1;

    const pipeline: any[] = [

        matchDate("departure", fromDate, toDate),

        ...JOIN("routes", "route"),

        ...JOIN("airports", "route.from"),

        matchAirport("route.from", from),

        ...JOIN("airports", "route.to"),

        matchAirport("route.to", to),

        ...JOIN("users", "airline", "code PIVA name logo"),

        matchAirlines(["airline"], airline),
        { $sort: { [sortBy]: sortOrder as 1 | -1 } } // type assertion: tells the compiler to consider the object as another type
    ]

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