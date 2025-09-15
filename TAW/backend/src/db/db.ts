const mongoose = require('mongoose');

const dockerServiceName = "db"
const DBname = "AirplanesDB"
const replicaSet = "rs0";
const mongoUri = `mongodb://${dockerServiceName}:27017/${DBname}?replicaSet=${replicaSet}`;

import { AddAirlines, addAirplanes, addAirports, addFlights, addPassengers, addRoutes, addTickets, AddUsers } from './start';

import {getModel as getAirportsModel} from '../models/Airport';
import {getModel as getRoutesModel, Route} from '../models/Route';
import {getModel as getAirlinesModel} from '../models/Airline';
import {getModel as getFlightsModel} from '../models/Flight';
import {getModel as getTicketsModel} from '../models/Ticket';
import {getModel as getAirplanesModel} from '../models/Airplane';
import {getModel as getPassengerModel} from '../models/Passenger';


export async function connectDB(){
    mongoose.connect(mongoUri)
    .then(() => {
        console.log("Connected to MongoDB");
    })
    // Create admin
    .then(async () => {
        AddUsers();
        await AddAirlines();

        const air = await getAirlinesModel().find({}, "_id code").exec();
        const airlines = new Map(air.map(airline => [airline.code, airline._id]));

        await addAirports();
        const airp = await getAirportsModel().find({}, "_id code").exec();
        const airports = new Map(airp.map(airport => [airport.code, airport._id]));

        await addAirplanes(airlines);
        const airpl = await getAirplanesModel().find({}, "_id code").exec();
        const airplanes = new Map(airpl.map(airplane => [airplane.code, airplane._id]));

        await addRoutes(airports);

        const r = await getRoutesModel()
            .find({}, "_id from to")
            .populate("from", "code")
            .populate("to", "code")
            .exec();
        const routes = new Map(r.map((route: any) => {
            return [`${route.from.code}-${route.to.code}`, route._id]
        }));
        
        // Flights
        await addFlights(routes, airlines, airplanes);
        const fl = await getFlightsModel().find({}, "_id code departure").exec();
        const flights = new Map(fl.map(flight => [`${flight.code}_${flight.departure.getTime()}`, flight._id]));

        // Tickets
        await addTickets(flights);
        const tic = await getTicketsModel().find({}, "_id code").exec();
        const tickets = new Map(tic.map(ticket => [ticket.code, ticket._id]));

        addPassengers(tickets);
    })
    .catch((err: string) => console.error('MongoDB connection error:', err));
}

