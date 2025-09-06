import Ro, {Route} from '../models/route';

// Aggregate per query più complesse
// $lookup              join
// $project             SELECT
// $unwind: $campo      1 Obj instead of Array
// $match               FROM ($And, $Or)
// /.*/:                math anything

async function getAllRoutes(query) {
    Ro.validateSearch(query)
    const { fromCountry = /.*/, toCountry = /.*/, fromCity = /.*/, toCity = /.*/ } = query

    return Ro.getModel().aggregate([
        {
            // $lookup: join
            $lookup: {
                from: "airports", // collection's name
                localField: "from", // FK
                foreignField: "_id", 
                as: "from"
            }
        },
        { $unwind: "$from" },
        {
            $lookup: {
                from: "airports",
                localField: "to", // FK
                foreignField: "_id", 
                as: "to"
            },
        },   
        { $unwind: "$to" },  
        {
            $match: {
                    "from.country": fromCountry,
                    "to.country": toCountry,
                    "from.city": fromCity,
                    "to.city": toCity
            }
        }
    ])

    // return Ro.getModel().find({}, "from, to")
    // .populate("from", "name city code country")
    // .populate("to", "name city code country")
}

async function getRoute(id: string){
    return Ro.getModel().findById(id);
}

async function createRoute(route: Partial<Route>){
    const ro = Ro.createRoute(route);
    return ro;
}

async function deleteRoute(id: string){
    return Ro.getModel().findByIdAndDelete(id);
}

async function updateRoute(id: string, data: any){
    Ro.validate(data);
    return Ro.getModel().findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

export default {
    getAllRoutes,
    getRoute,
    createRoute,
    deleteRoute,
    updateRoute
}