const mongoose = require('mongoose');

const DBname = "AirplanesDB"
const mongoUri = "mongodb://localhost:27017/" + DBname;

import { AddAirlines, addAirplanes, addAirports, addFlights, addRoutes, AddUsers } from './start';

import {getModel as getAirportsModel} from '../models/Airport';
import {getModel as getRoutesModel, Route} from '../models/route';
import {getModel as getAirlinesModel} from '../models/Airline';

export async function connectDB(){
    mongoose.connect(mongoUri)
    .then(() => {
        console.log("Connected to MongoDB");
    })
    // Create admin
    .then(async () => {
        AddUsers();
        await AddAirlines();

        const air = await getAirlinesModel().find({}, "_id name").exec();
        const airlines = new Map(air.map(airline => [airline.name, airline._id]));

        await addAirports();
        addAirplanes();

        // ALTERNATIVA: aggiungere ricerca con query parameters per routes, ...

        const a = await getAirportsModel().find({}, "_id code").exec();
        const airports = new Map(a.map(airport => [airport.code, airport._id]));

        await addRoutes(airports);

        const r = await getRoutesModel()
            .find({}, "_id from to")
            .populate("from", "code")
            .populate("to", "code")
            .exec();
        const routes = new Map(r.map((route: any) => {
            return [`${route.from.code}-${route.to.code}`, route._id]
        }));
        addFlights(routes, airlines);

    })
    .catch((err: string) => console.error('MongoDB connection error:', err));
}

