import {Airplane, getModel, newAirplane, validateUpdate} from '../models/airplane';

// Add airlines (if not exist)
async function getAllAirplanes() {
    return getModel().find();
}

async function getAirplane(id: string){
    return getModel().findById(id);
}

async function createAirplane(airplane: Partial<Airplane>){
    const ar = newAirplane(airplane);
    ar.save();
    console.log("\nAirplane created:");
    console.log(`-${airplane.code}\n-${airplane.model}\n`);
}

async function deleteAirplane(id: string){
    return getModel().findByIdAndDelete(id);
}

async function updateAirplane(id: string, data: any){
    validateUpdate(data);
    return getModel().findByIdAndUpdate(id, data);
}

export default {
    getAllAirplanes,
    getAirplane,
    createAirplane,
    deleteAirplane,
    updateAirplane
}