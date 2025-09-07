import { JOIN, matchAirport, matchDate } from '../db/queries';
import Fl, {Flight} from '../models/flight';
import mongoose from 'mongoose';

// async function getAllFlights(query) {
//     Fl.validateSearch(query);
//     const { from = /.*/, to = /.*/, fromDate = "", toDate = "", onlyDirect = false} = query;

//     const fromMatch = from ? { $regex: from, $options: "i" } : { $exists: true };
//     const toMatch = to ? { $regex: to, $options: "i" } : { $exists: true };

//     // Match departure and Arrival airports
//     const matchConditions: any[] = [
//         {
//             $or: [
//                     { "route.from.name": fromMatch },
//                     { "route.from.city": fromMatch },
//                     { "route.from.code": fromMatch },
//                     { "route.from.country": fromMatch },
//                 ]
//         }
//     ]

//     if (onlyDirect) {
//         matchConditions.push(
//             { 
//                 $or: [
//                         { "route.to.name": toMatch },
//                         { "route.to.city": toMatch },
//                         { "route.to.code": toMatch },
//                         { "route.to.country": toMatch },
//                     ]
//             }
//         );
//     }

//     const pipe: any[] = [
//         // WHERE departure BETWEEN fromDate AND toDate
//         {
//             $match: {
//                 departure: {
//                     $gte: fromDate ? new Date(fromDate) : new Date('1970-01-01'),
//                     $lte: toDate ? new Date(toDate) : new Date('2100-12-31'),
//                 },
//             }
//         },
//         // JOIN Route
//         {
//             $lookup: {
//                 from: "routes",
//                 localField: "route",
//                 foreignField: "_id",
//                 as: "route"
//             }
//         },
//         { $unwind: "$route" },
//         // JOIN Airport FROM
//         {
//             $lookup: {
//                 from: "airports",
//                 localField: "route.from",
//                 foreignField: "_id",
//                 as: "route.from"
//             }
//         },
//         { $unwind: "$route.from" },
//         // Join Airport TO
//         {
//             $lookup: {
//                 from: "airports",
//                 localField: "route.to",
//                 foreignField: "_id",
//                 as: "route.to"
//             }
//         },
//         { $unwind: "$route.to" },
//         // Join Airline
//         {
//             $lookup: {
//                 from: "users",
//                 localField: "airline",
//                 foreignField: "_id",
//                 as: "airline",
//                 pipeline: [
//                     { $project: { code: 1, name: 1, PIVA: 1, logo: 1 } }
//                 ]
//             }
//         },
//         { $unwind: "$airline" },
//         // Conditional match for from/to airports
//         {
//             $match: {
//                 $and: matchConditions
//             }
//         }
//     ];

//     if(!onlyDirect){
//         pipe.push(
//             {
//                 // JOIN Flights f2
//                 $lookup: {
//                     from: "flights",
//                     let: { firstTo: "$route.to._id", firstArrival: "$arrival" },
//                     pipeline: [
//                         // WHERE f2.departure > (f1.Arrival + 2 hours)
//                         {
//                             $match:{
//                                 $expr: {
//                                     $gte: [
//                                         "$departure",
//                                         {
//                                             $add: [ "$$firstArrival", 120 * 60000]
//                                         }
//                                     ]
//                                 }
//                             }
//                         },
//                         // JOIN Route
//                         {
//                             $lookup: {
//                                 from: "routes",
//                                 localField: "route",
//                                 foreignField: "_id",
//                                 as: "route"
//                             }
//                         },
//                         { $unwind: "$route" },
//                         // JOIN Airport From
//                         {
//                             $lookup: {
//                                 from: "airports",
//                                 localField: "route.from",
//                                 foreignField: "_id",
//                                 as: "route.from"
//                             }
//                         },
//                         { $unwind: "$route.from" },
//                         // JOIN Airport To
//                         {
//                             $lookup: {
//                                 from: "airports",
//                                 localField: "route.to",
//                                 foreignField: "_id",
//                                 as: "route.to"
//                             }
//                         },
//                         { $unwind: "$route.to" },
//                         // WHERE f1.To = f2.From AND f2.To LIKE %toMatch%
//                         {
//                             $match: {
//                                 $expr: { $eq: ["$$firstTo", "$route.from._id"] },
//                                 $or: [
//                                     { "route.to.name": toMatch },
//                                     { "route.to.city": toMatch },
//                                     { "route.to.code": toMatch },
//                                     { "route.to.country": toMatch }
//                                 ]
//                             }
//                         },
//                         // JOIN Airline
//                         {
//                             $lookup: {
//                                 from: "users",
//                                 localField: "airline",
//                                 foreignField: "_id",
//                                 as: "airline",
//                                 pipeline: [{ $project: { code: 1, name: 1, PIVA: 1, logo: 1 } }]
//                             }
//                         },
//                         { $unwind: "$airline" },
//                     ],
//                     as: "connections"
//                 }
//             },
//             {
//                 // Filter: Solo voli che hanno come destinazione finale toMatch (con scalo o toMatch come destinazione intermedia)
                
//                 // WHERE connenctions.size > 0 OR f1.To LIKE %toMatch%
//                 $match: {
//                     $or: [
//                         // Keeps flights with FROM match and no connections
//                         { "route.to.name": toMatch },
//                         { "route.to.city": toMatch },
//                         { "route.to.code": toMatch },
//                         { "route.to.country": toMatch },
//                         { $expr: { $gt: [{ $size: "$connections" }, 0] } }
//                     ]
//                 }
//             },
//         );
//     }
//     return Fl.getModel().aggregate(pipe);
// }

// async function getFlight(id: string, query){

//     Fl.validateSearch(query);
//     const { to = /.*/, onlyDirect = false} = query;
//     const toMatch = to ? { $regex: to, $options: "i" } : { $exists: true };

//     const pipe: any[] = [
//         {
//             $match: {_id: new mongoose.Types.ObjectId(id)}
//         },
//         // JOIN routes
//         {
//             $lookup: {
//                 from: "routes",
//                 localField: "route",
//                 foreignField: "_id",
//                 as: "route"
//             }
//         },
//         { $unwind: "$route" },
//         // JOIN Airport from
//         {
//             $lookup: {
//                 from: "airports",
//                 localField: "route.from",
//                 foreignField: "_id",
//                 as: "route.from"
//             }
//         },
//         { $unwind: "$route.from" },
//         // JOIN Airport To
//         {
//             $lookup: {
//                 from: "airports",
//                 localField: "route.to",
//                 foreignField: "_id",
//                 as: "route.to"
//             }
//         },
//         { $unwind: "$route.to" },
//         // Join Airline
//         {
//             $lookup: {
//                 from: "users",
//                 localField: "airline",
//                 foreignField: "_id",
//                 as: "airline",
//                 pipeline: [
//                     { $project: { code: 1, name: 1, PIVA: 1, logo: 1 } }
//                 ]
//             }
//         },
//     ];

//     if(!onlyDirect){
//         pipe.push(
//             {
//                 $lookup: {
//                     from: "flights",
//                     // Arrival of first flight, date and duration
//                     let: { firstTo: "$route.to._id", firstArrival: "$arrival" },
//                     pipeline: [
//                         {
//                             $match:{
//                                 $expr: {
//                                     $gte: [
//                                         "$departure",
//                                         { $add: [ "$$firstArrival", 120 * 60000] }
//                                     ],
//                                 }
//                             }
//                         },
//                         {
//                             $lookup: {
//                                 from: "routes",
//                                 localField: "route",
//                                 foreignField: "_id",
//                                 as: "route"
//                             }
//                         },
//                         { $unwind: "$route" },
//                         {
//                             $lookup: {
//                                 from: "airports",
//                                 localField: "route.from",
//                                 foreignField: "_id",
//                                 as: "route.from"
//                             }
//                         },
//                         { $unwind: "$route.from" },
//                         {
//                             $lookup: {
//                                 from: "airports",
//                                 localField: "route.to",
//                                 foreignField: "_id",
//                                 as: "route.to"
//                             }
//                         },
//                         { $unwind: "$route.to" },
//                         {
//                             $match: {
//                                 $and: [
//                                     { $expr: { $eq: ["$route.from._id", "$$firstTo"] } },
//                                     { 
//                                         $or: [
//                                             { "route.to.name": toMatch },
//                                             { "route.to.city": toMatch },
//                                             { "route.to.code": toMatch },
//                                             { "route.to.country": toMatch },
//                                         ] 
//                                     }
//                                 ]
//                             }
//                         },
//                         {
//                             $lookup: {
//                                 from: "users",
//                                 localField: "airline",
//                                 foreignField: "_id",
//                                 as: "airline",
//                                 pipeline: [{ $project: { code: 1, name: 1, PIVA: 1, logo: 1 } }]
//                             }
//                         },
//                         { $unwind: "$airline" },
//                     ],
//                     as: "connections"
//                 }
//             },
//         )
//     }

//     return (await Fl.getModel().aggregate(pipe))[0];
// }

// Direct Flights
export async function getAllFlights(query){
    Fl.validateSearch(query);
    let { from, to, fromDate = "", toDate = ""} = query;

    from = from ? { $regex: from, $options: "i" } : /.*/;
    to = to ? { $regex: to, $options: "i" } : /.*/;

    const pipeline = [

        matchDate("departure", fromDate, toDate),

        ...JOIN("routes", "route"),

        ...JOIN("airports", "route.from"),

        matchAirport("route.from", from),

        ...JOIN("airports", "route.to"),

        matchAirport("route.to", to),

        ...JOIN("users", "airline", "code PIVA name logo"),
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

async function getItineraries(query){
    const {from, where} = query;
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