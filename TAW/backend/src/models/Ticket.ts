import mongoose = require('mongoose');
import { Passenger } from './Passenger';
import { Flight } from './Flight';

// Interface
export interface Ticket{
    type: 'ECONOMY' | 'BUSINESS' | 'FIRST CLASS',
    extra: 'LARGER SEAT' | 'PRIORITY' | 'EXTRA BAG',
    price: number,
    seat: `${"A" | "B" | "C" | "D" | "F"}${number}`,
    passenger: Passenger,
    flight: Flight
}

// Schema

const TicketSchema = new mongoose.Schema<Ticket>({
    type: {
        type: String,
        enum: ["ECONOMY", "BUSINESS", "FIRST CLASS"], 
        required: true
    },
    
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