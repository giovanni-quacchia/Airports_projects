import Ti, {Ticket} from '../models/Ticket';

async function getAllTickets(query) {
    Ti.validateSearch(query);
    const { minPrice = /.*/, maxPrice = /.*/, minQuantity = /.*/, maxQuantity = /.*/, fromDate = "", toDate = ""} = query

    return Ti.getModel().aggregate([
        { $match: {
            "price":{
                $gte: minPrice,
                $lte: maxPrice
            },
            "quantity":{
                $gte: minQuantity,
                $lte: maxQuantity
            }
        }}
        {
            $lookup: {
                from: "flights", 
                localField: "flight", 
                foreignField: "_id", 
                as: "flight"
            }
        }
    ])

    // return Ti.getModel().aggregate([
    //     {
    //         // Join Route
    //         $lookup: {
    //             from: "routes", // collection's name
    //             localField: "route", // FK
    //             foreignField: "_id", 
    //             as: "route"
    //         }
    //     },
    //     { $unwind: "$route"},
    //     {
    //         // Join From Airport
    //         $lookup: {
    //             from: "airports", // collection's name
    //             localField: "route.from", // FK
    //             foreignField: "_id", 
    //             as: "route.from"
    //         }
    //     },
    //     {$unwind: "$route.from"},
    //     {
    //         // Join To Airport
    //         $lookup: {
    //             from: "airports", // collection's name
    //             localField: "route.to", // FK
    //             foreignField: "_id", 
    //             as: "route.to"
    //         }
    //     },
    //     {$unwind: "$route.to"},
    //     {
    //         // Join Airline
    //         $lookup: {
    //             from: "users", // airlines is a subclass of user
    //             localField: "airline", // FK
    //             foreignField: "_id", 
    //             as: "airline",
    //             pipeline: [
    //                 {$project: {code: 1, name: 1, PIVA: 1, logo: 1}}
    //             ]
    //         }
    //     },
    //     {$unwind: "$airline"},
    //     {
    //         $match: {
    //                 "route.from.country": fromCountry,
    //                 "route.to.country": toCountry,
    //                 "route.from.city": fromCity,
    //                 "route.to.city": toCity,
    //                 "date":{
    //                     $gt: fromDate ? new Date(fromDate) : new Date('1970-01-01'),
    //                     $lt: toDate ? new Date(toDate) : new Date('2100-12-31')
    //                 }
    //         }
    //     }
    // ])
}

async function getTicket(id: string){
    return Ti.getModel().findById(id);
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