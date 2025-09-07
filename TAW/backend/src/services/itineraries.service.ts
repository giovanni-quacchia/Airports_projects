import { getAirportContidions, JOIN, JOINStop, matchAirport, matchDate } from "../db/queries";
import { checkKeys } from "../utils/utils";
import Fl, {Flight} from '../models/flight';
import { getAllFlights } from "../services/flights.service";

async function getAllItineraries(query){
    checkQuery(query);
    let { from, to, fromDate = "", toDate = "", onlyDirect = false} = query;

    from = from ? { $regex: from, $options: "i" } : /.*/;
    to = to ? { $regex: to, $options: "i" } : /.*/;

    if(onlyDirect) return getAllFlights(query);

    const pipeline = [

        matchDate("departure", fromDate, toDate),

        ...JOIN("routes", "route"),

        ...JOIN("airports", "route.from"),
        
        matchAirport("route.from", from),

        ...JOIN("airports", "route.to"),

        ...JOIN("users", "airline", "code PIVA name logo"),

        // Manage stops

        ...JOINStop("flights", "route.to._id", "route.from", "stop1", to, "departure"),

        ...JOINStop("flights", "stop1.route.to._id", "route.from", "stop2", to, "stop1.departure"),

        // Mantieni i voli con f1.To = to OR f2.to = to
        {
            $match:{
                $or: [
                    ...getAirportContidions("route.to", to),
                    ...getAirportContidions("stop1.route.to", to),
                    ...getAirportContidions("stop2.route.to", to),
                ]
            }
        }
    ]

    return Fl.getModel().aggregate(pipeline)
}

function checkQuery(data: any): boolean{
    
    if(typeof data !== "object" || data === null || Array.isArray(data)) throw Error("Not valid data");

    const keys = Object.keys(data);

    if(!keys.includes("from") || !keys.includes("to"))
        throw Error("Searching an itinerary requires at least from and to locations")

    if(
        (!data.from || typeof data.from !== 'string') &&
        (!data.to || typeof data.to !== 'string') &&
        (!data.fromDate || typeof data.fromDate !== 'string') &&
        (!data.toDate || typeof data.toDate !== 'string') &&
        (!data.onlyDirect || (data.onlyDirect !== 'true' && data.onlyDirect !== 'false'))
    )
        throw Error("Searching an itinerary not valid");

    if(data.onlyDirect) data.onlyDirect = (data.onlyDirect === 'true');
        
    // Check if there are not valid keys
    if(checkKeys(keys, ["from", "to", "fromDate", "toDate", "onlyDirect"])) return true;
    else
        throw Error("Not valid data");
}

export default{
    getAllItineraries
}