import Airline from '../models/airline';
import crypto from 'crypto'

// Add airlines (if not exist)
async function getAllAirlines() {
    return Airline.getModel().find();
}

async function getAirline(id: string){
    return Airline.getModel().findById(id);
}

async function newAirline(airline){

    if(!airline.PIVA || !airline.name){
        throw new Error("Airline PIVA and name required");
    }

    const ar = Airline.newAirline(airline);
    const pw = crypto.randomBytes(16).toString("hex");
    ar.setPassword(pw);
    ar.save();
    console.log("\nAirline created:");
    console.log(`-${airline.name}\n-${airline.mail}:${pw}\n`);
}

async function deleteAirline(id: string){
    return Airline.getModel().deleteOne({_id: id});
}

export default {
    getAllAirlines,
    getAirline,
    newAirline,
    deleteAirline
}