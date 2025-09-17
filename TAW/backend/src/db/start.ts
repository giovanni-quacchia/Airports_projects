const pc = require('picocolors')

// Models
import {getModel as getAirlineModel} from '../models/airline';
import {getModel as getAirplaneModel} from '../models/airplane';
import {getModel as getAirportsModel} from '../models/airport';
import {getModel as getUserModel} from '../models/user';
import {getModel as getRouteModel} from '../models/route';
import {getModel as getFlightModel, newFlight} from '../models/flight'
import {getModel as getTicketModel, newTicket} from '../models/Ticket'
import {getModel as getPassengerModel} from '../models/passenger'

// Data
import { airlines, users } from "./data";

// Services
import AirlinesSer from '../services/airlines.service'
import UsersServ from '../services/users.service'

export async function addData(model, data){
    console.log(pc.green(`\n[${model.modelName}s creation]\n`));
    for(const item of data){
        await model.updateOne(
            { _id: item._id }, // match by _id
            { $set: item },    // update fields
            { upsert: true }   // insert if not found
        );
    }
}

export async function AddUsers(){
    console.log(pc.green("\n[Users creation]\n"));
    for(const user of users){
        const exists = await getUserModel().findOne({mail: user.mail});
        if(!exists){
            let u = await UsersServ.createUser(user);
        }
    }
}

export async function AddAirlines() {
    console.log(pc.green("\n[Airlines creation]\n"));
    for (const airline of airlines) {
        const exists = await getAirlineModel().findOne({code: airline.code});
        if (!exists) {
            const {airline: a, password} = await AirlinesSer.createAirline(airline);
            await a.save();
        }
    }
}

