import mongoose from 'mongoose';
import { JOIN } from '../db/queries';
import {Airplane, getModel, newAirplane, validatePut} from '../models/airplane';
import Airline from '../models/airline'
import { AppError } from '../models/AppError';

async function getAllAirplanes(airlineId = "") {

    const pipeline = []

    // Get airplanes of :airlineId airline
    if(airlineId){
        pipeline.push(
            { $match: {airline: new mongoose.Types.ObjectId(airlineId)}}
        )
    }

    pipeline.push(
        ...JOIN("airlines", "airline", "code name PIVA logo")
    );

    return getModel().aggregate(pipeline);
}

async function getAirplane(id: string){
    return getModel().findById(id)
        .populate({
            path: "airline",
            select: "code PIVA name logo"
        })
}

async function createAirplane(data){

    let doc: any = {};

    // Start transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Check if airline exists
        const airline = await Airline.getModel().findById(data.airline).session(session);
        if(!airline) throw new AppError("Airline not found", 4005);

        doc = newAirplane(data);
        await doc.save({session});

        await session.commitTransaction();
    }catch (error) {
        await session.abortTransaction(); // rollback
        throw error;
    } finally {
        session.endSession();
    }
    return newAirplane;
}

async function deleteAirplane(id: string){
    return getModel().findByIdAndDelete(id);
}

async function updateAirplane(id: string, data: any){
    const query = validatePut(data);
    return getModel().findByIdAndUpdate(id, query, { new: true, runValidators: true });
}

export default {
    getAllAirplanes,
    getAirplane,
    createAirplane,
    deleteAirplane,
    updateAirplane
}