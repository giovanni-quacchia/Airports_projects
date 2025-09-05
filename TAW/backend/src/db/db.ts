const mongoose = require('mongoose');

const DBname = "AirplanesDB"
const mongoUri = "mongodb://localhost:27017/" + DBname;

import { AddAirlines, addAirplanes, addAirports, addFlights, addRoutes, AddUsers } from './start';

import {getModel as getAirportsModel} from '../models/Airport';
import {getModel as getRoutesModel} from '../models/route';


export async function connectDB(){
    mongoose.connect(mongoUri)
    .then(() => {
        console.log("Connected to MongoDB");
    })
    // Create admin
    .then(async () => {
        AddUsers();
        await AddAirlines();
        await addAirports();
        addAirplanes();

        // ALTERNATIVA: aggiungere ricerca con query parameters per routes, ...

        const a = await getAirportsModel().find({}, "_id code").exec();
        const airports = new Map(a.map(airport => [airport.code, airport._id]));

        await addRoutes(airports);


        addFlights()

    })
    .catch((err: string) => console.error('MongoDB connection error:', err));
}

