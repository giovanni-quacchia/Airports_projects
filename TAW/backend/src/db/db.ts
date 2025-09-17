const mongoose = require('mongoose');

const dockerServiceName = "db"
const DBname = "AirplanesDB"
const replicaSet = "rs0";
const mongoUri = `mongodb://${dockerServiceName}:27017/${DBname}?replicaSet=${replicaSet}`;

import { AddAirlines, addData, AddUsers } from './start';

import {getModel as getAirportsModel} from '../models/Airport';
import {getModel as getRoutesModel} from '../models/Route';
import {getModel as getFlightsModel} from '../models/Flight';
import {getModel as getTicketsModel} from '../models/Ticket';
import {getModel as getAirplanesModel} from '../models/Airplane';
import {getModel as getPassengerModel} from '../models/Passenger';
import {getModel as getPurchaseModel} from '../models/Purchase';
import { airplanes, airports, flights, passengers, purchases, routes, tickets } from './data';

export async function connectDB(){
    mongoose.connect(mongoUri)
    .then(() => {
        console.log("Connected to MongoDB");
    })
    // TODO: call only when DB is empty
    .then(async () => {
        AddUsers()
        AddAirlines()
        addData(getAirportsModel(), airports);
        addData(getAirplanesModel(), airplanes);
        addData(getRoutesModel(), routes);
        addData(getFlightsModel(), flights);
        addData(getTicketsModel(), tickets);
        addData(getPurchaseModel(), purchases);
        addData(getPassengerModel(), passengers);
    })
    .catch((err: string) => console.error('MongoDB connection error:', err));
}

