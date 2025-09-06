import Ar, {Airport} from '../models/Airport';
import crypto from 'crypto'

// Add Airports (if not exist)
async function getAllAirports() {
    return Ar.getModel().find();
}

async function getAirport(id: string){
    return Ar.getModel().findById(id);
}

async function createAirport(airport: Partial<Airport>){
    const ar = Ar.createAirport(airport);
    return ar;
}

async function deleteAirport(id: string){
    return Ar.getModel().findByIdAndDelete(id);
}

async function updateAirport(id: string, data: any){
    Ar.validateUpdate(data);
    return Ar.getModel().findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

export default {
    getAllAirports,
    getAirport,
    createAirport,
    deleteAirport,
    updateAirport
}