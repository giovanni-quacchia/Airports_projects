import mongoose = require('mongoose');
import { User } from './user';
import { Url } from 'url';


// Interface

export interface Airline extends User{
    PIVA: string,
    name: string,
    logo: Url
}

// Schema

const AirlineSchema = new mongoose.Schema<Airline>({
    PIVA: {type: String, required: true, unique: true},
    name: {type: String, required: true},
    logo: {type: String}
});

// Model
// Discriminator: 

let airlineModel: mongoose.Model<Airline>;
export function getModel(): mongoose.Model<Airline>{
    if(!airlineModel){
        const userModel = getModel();
        airlineModel = userModel.discriminator<Airline>('Airline', AirlineSchema);
    }
    return airlineModel;
}

export function newAirline(data): Airline {
    const _airlineModel = getModel();
    const airline = new _airlineModel(data);
    return airline;
}