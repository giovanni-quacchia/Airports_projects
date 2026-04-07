import { addItineraryFields, getAirportContidions, JOIN, JOINStop, matchAirlines, matchAirport, matchDate } from "../db/queries";
import { isObject, validateObj, validatePartialObj } from "../utils/utils";
import Fl from '../models/flight';
import { getAllFlights } from "../services/flights.service";
import { AppError } from "../models/AppError";

async function getAllItineraries(data){
    const query: any = checkQuery(data);
    let { from, to, fromDate = "", toDate = "", onlyDirect = false, maxStops = 2, airline, sortBy = "departure", order = "asc"} = query;
    
    airline = airline ? { $regex: airline, $options: "i" } : /.*/;

    const sortOrder = order === "asc" ? 1 : -1;

    sortBy = (sortBy === "duration") ? "totDuration" : (sortBy === "arrival") ? "finalArrival" : sortBy;

    if(onlyDirect || maxStops === 0){
        const { maxStops, onlyDirect, ...rest} = query
        return getAllFlights(rest);
    }

    const pipeline: any[] = [

        matchDate("departure", fromDate, toDate),

        ...JOIN("routes", "route"),

        ...JOIN("airports", "route.from"),
        
        matchAirport("route.from", from),

        ...JOIN("airports", "route.to"),

        ...JOIN("airlines", "airline", "code PIVA name logo"),
        
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

function checkQuery(data: any){
    
    if(!isObject(data)) throw new AppError("Object expected", 4005);

    const query = validateObj({
        from: [data.from, "string"],
        to: [data.to, "string"]
    })

    const optQuery = validatePartialObj({
        fromDate: [data.fromDate, "date"],
        toDate: [data.toDate, "date"],
        onlyDirect: [data.onlyDirect, "boolean"],
        maxStops: [data.maxStops, "number"],
        airline: [data.airline, "string"],
        sortBy: [data.sortBy, "string"],
        order: [data.order, "string"]
    })

    if(
        (data.sortBy && !["departure", "arrival", "duration", "numStops"].includes(data.sortBy)) || 
        (data.order && !data.sortBy)
    )
        throw new AppError("Itineraries can be sorted by departure, arrival, duration or numStops", 4005);

    if(data.order && data.order !== "desc" && data.order !== "asc")
        throw new AppError("Order parameter not valid", 4005);
        
    return {...query, ...optQuery};
}

export default{
    getAllItineraries
}