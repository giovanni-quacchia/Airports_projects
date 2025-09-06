import Fl, {Flight} from '../models/flight';

async function getAllFlights(query) {
    Fl.validateSearch(query);
    const { from = /.*/, to = /.*/, fromDate = "", toDate = "", onlyDirect = false} = query
    const fromMatch = from ? { $regex: from, $options: "i" } : { $exists: true };
    const toMatch = to ? { $regex: to, $options: "i" } : { $exists: true };

    // From airport
    const fromOr = [
        { "route.from.name": fromMatch },
        { "route.from.city": fromMatch },
        { "route.from.code": fromMatch },
        { "route.from.country": fromMatch },
    ];

    // to airport
    const toOr = [
        { "route.to.name": toMatch },
        { "route.to.city": toMatch },
        { "route.to.code": toMatch },
        { "route.to.country": toMatch },
    ];

const matchConditions: any[] = [ { $or: fromOr } ];

if (onlyDirect) {
    matchConditions.push({ $or: toOr });
}

const pipe: any[] = [
    // Filter by departure date
    {
        $match: {
            departure: {
                $gt: fromDate ? new Date(fromDate) : new Date('1970-01-01'),
                $lt: toDate ? new Date(toDate) : new Date('2100-12-31'),
            }
        }
    },
    // Join Route
    {
        $lookup: {
            from: "routes",
            localField: "route",
            foreignField: "_id",
            as: "route"
        }
    },
    { $unwind: "$route" },
    // Join From Airport
    {
        $lookup: {
            from: "airports",
            localField: "route.from",
            foreignField: "_id",
            as: "route.from"
        }
    },
    { $unwind: "$route.from" },
    // Join To Airport
    {
        $lookup: {
            from: "airports",
            localField: "route.to",
            foreignField: "_id",
            as: "route.to"
        }
    },
    { $unwind: "$route.to" },
    // Join Airline
    {
        $lookup: {
            from: "users",
            localField: "airline",
            foreignField: "_id",
            as: "airline",
            pipeline: [
                { $project: { code: 1, name: 1, PIVA: 1, logo: 1 } }
            ]
        }
    },
    { $unwind: "$airline" },
    // Conditional match for from/to airports
    {
        $match: {
            $and: matchConditions
        }
    }
];

    // If not only direct flights
    if(!onlyDirect){
        pipe.push(
            {
                $lookup: {
                    from: "flights",
                    // Arrival of first flight, date and duration
                    let: { firstTo: "$route.to._id", firstArrival: "$arrival" },
                    pipeline: [
                        {
                            $match:{
                                $expr: {
                                    $gte: [
                                        "$departure",
                                        {
                                            $add: [ "$$firstArrival", 120 * 60000]
                                        }
                                    ]
                                }
                            }
                        },
                        {
                            $lookup: {
                                from: "routes",
                                localField: "route",
                                foreignField: "_id",
                                as: "route"
                            }
                        },
                        { $unwind: "$route" },
                        {
                            $lookup: {
                                from: "airports",
                                localField: "route.from",
                                foreignField: "_id",
                                as: "route.from"
                            }
                        },
                        { $unwind: "$route.from" },
                        {
                            $lookup: {
                                from: "airports",
                                localField: "route.to",
                                foreignField: "_id",
                                as: "route.to"
                            }
                        },
                        { $unwind: "$route.to" },
                        {
                            $lookup: {
                                from: "users",
                                localField: "airline",
                                foreignField: "_id",
                                as: "airline",
                                pipeline: [{ $project: { code: 1, name: 1, PIVA: 1, logo: 1 } }]
                            }
                        },
                        { $unwind: "$airline" },
                        {
                            $addFields: { fromId: "$route.from._id" }
                        },
                        {
                            $match: {
                                $expr: { $eq: ["$fromId", "$$firstTo"] },
                                $or: [
                                    { "route.to.name": toMatch },
                                    { "route.to.city": toMatch },
                                    { "route.to.code": toMatch },
                                    { "route.to.country": toMatch }
                                ]
                            }
                        }
                    ],
                    as: "connection"
                }
            },
            {
                // Filter: Solo voli che hanno come destinazione finale toMatch (con scalo o toMatch come destinazione intermedia)
                $match: {
                    $or: [
                        { "route.to.name": toMatch },
                            { "route.to.city": toMatch },
                            { "route.to.code": toMatch },
                            { "route.to.country": toMatch },
                        { $expr: { $gt: [{ $size: "$connection" }, 0] } }
                    ]
                }
            },
        );

    }
    return Fl.getModel().aggregate(pipe);
}

async function getFlight(id: string){
    return Fl.getModel().findById(id)
        .populate({
            path: "route", 
            populate: [{path: "from"}, {path: "to"}]
        })
        .populate("airline", "code PIVA name logo -__t");
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