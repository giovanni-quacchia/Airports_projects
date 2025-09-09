import { JOIN } from '../db/queries';
import Pa from '../models/passenger';

async function getAllpassengers(query) {
    return Pa.getModel().aggregate([
        ...JOIN("tickets", "ticket", "code, type price flight", "code")
    ])
}

async function getPassenger(id: string){
    return Pa.getModel().findById(id);
}

export async function createPassenger(passenger: {mail: string, password: string, isAdmin: boolean}){
    const pa = Pa.createPassenger(passenger);
    return pa.save();
}

async function deletePassenger(id: string){
    return Pa.getModel().findByIdAndDelete(id);
}

async function updatePassenger(id: string, data: any){
    Pa.validate(data);
    return Pa.getModel().findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

export default {
    getAllpassengers,
    getPassenger,
    createPassenger,
    deletePassenger,
    updatePassenger
}