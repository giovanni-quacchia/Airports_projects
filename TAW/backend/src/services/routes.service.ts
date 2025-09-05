import Ro, {Route} from '../models/route';

// Add Routes (if not exist)
async function getAllRoutes() {
    return Ro.getModel().find({}, "from, to")
    .populate("from", "name city code country")
    .populate("to", "name city code country");
}

async function getRoute(id: string){
    return Ro.getModel().findById(id);
}

async function createRoute(route: Partial<Route>){
    const ro = Ro.createRoute(route);
    return ro.save();
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