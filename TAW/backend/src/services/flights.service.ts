import Fl, {Flight} from '../models/flight';

async function getAllFlights(query) {
    Fl.validateSearch(query);
    const { fromCountry = /.*/, toCountry = /.*/, fromCity = /.*/, toCity = /.*/, fromDate = "", toDate = ""} = query

    return Fl.getModel().aggregate([
        {
            // Join Route
            $lookup: {
                from: "routes", // collection's name
                localField: "route", // FK
                foreignField: "_id", 
                as: "route"
            }
        },
        { $unwind: "$route"},
        {
            // Join From Airport
            $lookup: {
                from: "airports", // collection's name
                localField: "route.from", // FK
                foreignField: "_id", 
                as: "route.from"
            }
        },
        {$unwind: "$route.from"},
        {
            // Join To Airport
            $lookup: {
                from: "airports", // collection's name
                localField: "route.to", // FK
                foreignField: "_id", 
                as: "route.to"
            }
        },
        {$unwind: "$route.to"},
        {
            // Join Airline
            $lookup: {
                from: "users", // airlines is a subclass of user
                localField: "airline", // FK
                foreignField: "_id", 
                as: "airline",
                pipeline: [
                    {$project: {code: 1, name: 1, PIVA: 1, logo: 1}}
                ]
            }
        },
        {$unwind: "$airline"},
        {
            $match: {
                    "route.from.country": fromCountry,
                    "route.to.country": toCountry,
                    "route.from.city": fromCity,
                    "route.to.city": toCity,
                    "date":{
                        $gt: fromDate ? new Date(fromDate) : new Date('1970-01-01'),
                        $lt: toDate ? new Date(toDate) : new Date('2100-12-31')
                    }
            }
        }
    ])
}

async function getFlight(id: string){
    return Fl.getModel().findById(id);
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