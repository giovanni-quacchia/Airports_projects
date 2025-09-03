import mongoose = require('mongoose');

// Interface
export interface Airport{
    name: string,
    city: string,
    code: string,
    country: string
}

// Schema

const AirportSchema = new mongoose.Schema<Airport>({
    name: {type: String},
    city: {type: String, unique: true},
    code: {
        type: String,
        match: /^[A-Z]{3}$/ // regex for 3 uppercase letters
    }, 
    country: {type: String}
});

// Model
// Discriminator: 

let airportModel: mongoose.Model<Airport>;
export function getModel(): mongoose.Model<Airport> {
    if(!airportModel) airportModel = mongoose.model<Airport>('Airport', AirportSchema);
    return airportModel;
}

export function newAirline(data): Airport {
    const _airportModel = getModel();
    const airport = new _airportModel(data);
    return airport;
}