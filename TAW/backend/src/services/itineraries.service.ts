import { addItineraryFields, getAirportContidions, JOIN, JOINStop, matchAirlines, matchAirport, matchDate } from "../db/queries";
import { checkKeys } from "../utils/utils";
import Fl from '../models/flight';
import { getAllFlights } from "../services/flights.service";

async function getAllItineraries(query){
    checkQuery(query);
    let { from, to, fromDate = "", toDate = "", onlyDirect = false, maxStops = 2, airline, sortBy = "departure", order = "asc"} = query;
    
    airline = airline ? { $regex: airline, $options: "i" } : /.*/;

    const sortOrder = order === "asc" ? 1 : -1;

    sortBy = (sortBy === "duration") ? "totDuration" : (sortBy === "arrival") ? "finalArrival" : sortBy;

    if(onlyDirect || maxStops === 0){
        const { maxStops, ...rest} = query
        return getAllFlights(rest);
    }

    const pipeline: any[] = [

        matchDate("departure", fromDate, toDate),

        ...JOIN("routes", "route"),

        ...JOIN("airports", "route.from"),
        
        matchAirport("route.from", from),

        ...JOIN("airports", "route.to"),

        ...JOIN("users", "airline", "code PIVA name logo"),
        
        ...JOIN("airplanes", "airplane"),

        // Manage 1 stop
        ...JOINStop("flights", "route.to._id", "route.from", "stop1", to, "departure"),
    ]

    // Manage 2 stops
    if(maxStops === 2){
        pipeline.push(
            
            ...JOINStop("flights", "stop1.route.to._id", "route.from", "stop2", to, "stop1.departure"),

            // Mantieni i voli con f1.To = to OR f2.to = to
            {
                $match:{
                    $or: [
                        ...getAirportContidions("route.to", to, false),
                        ...getAirportContidions("stop1.route.to", to, false),
                        ...getAirportContidions("stop2.route.to", to, false),
                    ]
                }
            }
        )
    } else {
        pipeline.push(
            {
                $match:{
                    $or: [
                        ...getAirportContidions("route.to", to, false),
                        ...getAirportContidions("stop1.route.to", to, false),
                    ]
                }
            }        )
    }

    pipeline.push( 
        matchAirlines(["airline", "stop1.airline", "stop2.airline"], airline),
        ...addItineraryFields(),
        { $sort: { [sortBy]: sortOrder } }
    )

    return Fl.getModel().aggregate(pipeline);
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
        (!data.onlyDirect || (data.onlyDirect !== 'true' && data.onlyDirect !== 'false')) && 
        (!data.maxStops || isNaN(Number(data.maxStops))) &&
        (!data.airline || typeof data.airline !== 'string') &&
        (!data.sortBy || typeof data.sortBy !== 'string') &&
        (!data.order || typeof data.order !== 'string')
    )
        throw Error("Searching an itinerary not valid");

    if(data.onlyDirect) data.onlyDirect = (data.onlyDirect === 'true');
    if(data.maxStops) data.maxStops = Number(data.maxStops)

    if(
        (data.sortBy && !["departure", "arrival", "duration", "numStops"].includes(data.sortBy)) || 
        (data.order && !data.sortBy)
    )
        throw Error("Sorting parameters not valid");

    if(data.order && data.order !== "desc" && data.order !== "asc")
        throw Error("Order parameter not valid");
        
    // Check if there are not valid keys
    if(checkKeys(keys, ["from", "to", "fromDate", "toDate", "onlyDirect", "maxStops", "airline", "sortBy", "order"])) return true;
    else
        throw Error("Not valid data");
}

export default{
    getAllItineraries
}