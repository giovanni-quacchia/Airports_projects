import Ar, {Airline} from '../models/Airline';
import crypto from 'crypto'

// Add airlines (if not exist)
async function getAllAirlines() {
    return Ar.getModel().find();
}

async function getAirline(id: string){
    return Ar.getModel().findById(id);
}

async function createAirline(airline: Partial<Airline>){
    const ar = Ar.newAirline(airline);
    const pw = crypto.randomBytes(16).toString("hex");
    ar.setPassword(pw);
    ar.save();
    console.log("\nAirline created:");
    console.log(`-${airline.name}\n-${airline.mail}:${pw}\n`);
}

async function deleteAirline(id: string){
    return Ar.getModel().findByIdAndDelete(id);
}

async function updateAirline(id: string, data: any){
    Ar.validateUpdate(data);
    return Ar.getModel().findByIdAndUpdate(id, data);
}

export default {
    getAllAirlines,
    getAirline,
    createAirline,
    deleteAirline,
    updateAirline
}