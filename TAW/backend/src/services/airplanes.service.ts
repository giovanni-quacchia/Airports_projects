import mongoose from 'mongoose';
import { JOIN } from '../db/queries';
import {Airplane, getModel, newAirplane, validateUpdate} from '../models/airplane';

// TODO: get airplanes of an airline
async function getAllAirplanes(airlineId = "") {

    const pipeline = []
    if(airlineId){
        pipeline.push(
            { $match: {airline: new mongoose.Types.ObjectId(airlineId)}}
        )
    }

    pipeline.push(
        ...JOIN("users", "airline", "code PIVA name logo -__t")
    );

    return getModel().aggregate(pipeline);
}

async function getAirplane(id: string){
    return getModel().findById(id)
        .populate({
            path: "airline",
            select: "code PIVA name logo -__t"
        })
}

async function createAirplane(airplane: Partial<Airplane>){
    const doc = newAirplane(airplane);



    await doc.save();
    return doc;
}

async function deleteAirplane(id: string){
    return getModel().findByIdAndDelete(id);
}

async function updateAirplane(id: string, data: any){
    validateUpdate(data);
    return getModel().findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

export default {
    getAllAirplanes,
    getAirplane,
    createAirplane,
    deleteAirplane,
    updateAirplane
}