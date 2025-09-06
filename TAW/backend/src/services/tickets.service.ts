import Ti, {Ticket} from '../models/Ticket';

async function getAllTickets(query) {
    Ti.validateSearch(query);
    const { minPrice = 0, maxPrice = 99999, minQuantity = 0, maxQuantity = 99999, type = /.*/, from = /.*/, to = /.*/} = query
    const fromMatch = from ? { $regex: from, $options: "i" } : { $exists: true };
    const toMatch = to ? { $regex: to, $options: "i" } : { $exists: true };
    
    return Ti.getModel().aggregate([
        // WHERE price, quantity
        { 
            $match: {
                "type": type,
                "price":{ $gte: minPrice, $lte: maxPrice},
                "quantity":{$gte: minQuantity, $lte: maxQuantity}
            }
        },
        // JOIN Flight
        {
            
            $lookup: {
                from: "flights", 
                localField: "flight", 
                foreignField: "_id", 
                as: "flight"
            }
        },
        { $unwind: "$flight" },
        // JOIN Route
        {
            $lookup: {
                from: "routes", 
                localField: "flight.route", 
                foreignField: "_id", 
                as: "flight.route"
            }
        },
        { $unwind: "$flight.route" },
        // JOIN From Airport
        {
            $lookup: {
                from: "airports", 
                localField: "flight.route.from", 
                foreignField: "_id", 
                as: "flight.route.from",
            }
        },
        { $unwind: "$flight.route.from" },
        // JOIN To Airport
        {
            $lookup: {
                from: "airports", 
                localField: "flight.route.to", 
                foreignField: "_id", 
                as: "flight.route.to",
            }
        },
        { $unwind: "$flight.route.to" },
        // JOIN Airline
        {
            $lookup: {
                from: "users", 
                localField: "flight.airline", 
                foreignField: "_id", 
                as: "flight.airline",
                pipeline: [
                    { $project: {name: 1, code: 1, PIVA: 1, logo: 1 } }
                ]
            }
        },
        { $unwind: "$flight.airline" },
        // Match direct flights
        // WHERE ( from.name LIKE ... OR ... from.country LIKE ... ) AND (to.name LIKE ... OR to.country LIKE ...)
        { 
            $match: {
                $and: [
                    {
                    $or: [
                        {"flight.route.from.name": fromMatch }, // LIKE operator: /text/i (i: case insensitive)
                        {"flight.route.from.city": fromMatch },
                        {"flight.route.from.code": fromMatch },
                        {"flight.route.from.country": fromMatch }
                    ],
                    },
                    {
                    $or: [
                        {"flight.route.to.name": toMatch }, // LIKE operator: /text/i (i: case insensitive)
                        {"flight.route.to.city": toMatch },
                        {"flight.route.to.code": toMatch},
                        {"flight.route.to.country": toMatch }
                    ]
                    }
                ]
            }
        },
    ])
}

async function getTicket(id: string){
    return (await Ti.getModel().findById(id))
        .populate({
            path: "flight",
            populate: [
                {
                path: "route",
                populate: [
                    { path: "from" },
                    { path: "to" }
                ]
                },
                {
                path: "airline",
                select: "code PIVA name logo -__t"  // select only these fields
                }
            ]
        });
}

async function createTicket(Ticket: Partial<Ticket>){
    const ti = Ti.createTicket(Ticket);
    return ti.save();
}

async function deleteTicket(id: string){
    return Ti.getModel().findByIdAndDelete(id);
}

async function updateTicket(id: string, data: any){
    Ti.validate(data);
    return Ti.getModel().findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

export default {
    getAllTickets,
    getTicket,
    createTicket,
    deleteTicket,
    updateTicket
}