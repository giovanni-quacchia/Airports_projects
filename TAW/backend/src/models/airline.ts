import mongoose = require('mongoose');
import { User } from './user';
import {getModel as getUserModel} from './user'

// Interface
export interface Airline extends User, mongoose.Document{
    PIVA: string,
    name: string,
    logo: string
}

// Schema

const AirlineSchema = new mongoose.Schema<Airline>({
    PIVA: {type: String, required: true, unique: true},
    name: {type: String, required: true},
    logo: {type: String}
});

// Model

let airlineModel: mongoose.Model<Airline>;
export function getModel(): mongoose.Model<Airline>{
    if(!airlineModel){
        const userModel = getUserModel();
        airlineModel = userModel.discriminator<Airline>('Airline', AirlineSchema);
    }
    return airlineModel;
}

// Partial?
export function newAirline(data): Airline {
    const _airlineModel = getModel();
    const airline = new _airlineModel(data);
    return airline;
}

export default {getModel, newAirline}