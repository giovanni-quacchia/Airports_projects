import { matchAirport } from '../db/queries';
import Ar, {Airport} from '../models/Airport';

// Add Airports (if not exist)
async function getAllAirports(query) {
    const {q} = query
    return Ar.getModel().aggregate([
        matchAirport("", q)
    ])
}

async function getAirport(id: string){
    return Ar.getModel().findById(id);
}

async function createAirport(airport: Partial<Airport>){
    const parsedData = Ar.validateNew(airport)
    const ar = Ar.createAirport(parsedData);
    return ar;
}

async function deleteAirport(id: string){
    return Ar.getModel().findByIdAndDelete(id);
}

async function updateAirport(id: string, data: any){
    const parsedData: any = Ar.validatePut(data);
    return Ar.getModel().findByIdAndUpdate(id, parsedData, { new: true, runValidators: true });
}

export default {
    getAllAirports,
    getAirport,
    createAirport,
    deleteAirport,
    updateAirport
}