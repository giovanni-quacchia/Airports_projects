import mongoose = require('mongoose');
import { User } from './user';


// Interface

export interface Passenger extends User{
    name: string;
    surname: string;
    CF: string;
    // passportNumber
}

// Schema

const passengerSchema = new mongoose.Schema<Passenger>({
    name: {type: String, required: true},
    surname: {type: String, required: true},
    // passportNumber
});

// Model
// Discriminator: 

let passengerModel: mongoose.Model<Passenger>;
export function getModel(): mongoose.Model<Passenger>{
    if(!passengerModel){
        const userModel = getModel();
        passengerModel = userModel.discriminator<Passenger>('Passenger', passengerSchema);
    }
    return passengerModel;
}

export function newPassenger(data): Passenger {
    const _passengerModel = getModel();
    const passenger = new _passengerModel(data);
    return passenger;
}