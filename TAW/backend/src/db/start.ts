const pc = require('picocolors')

// Models
import {getModel as getAirlineModel} from '../models/Airline';
import {getModel as getUserModel} from '../models/User';
import {getModel as getTicketModel} from '../models/Ticket';


// Data
import { airlines, users } from "./data";

// Services
import AirlinesSer from '../services/airlines.service'
import UsersServ from '../services/users.service'
import { getAirline } from '../controllers/airlines.controller';

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
        const exists = await getUserModel().findOne({_id: user._id});
        if(!exists){
            let u = await UsersServ.createUser(user);
        }
    }
}

export async function AddAirlines() {
    console.log(pc.green("\n[Airlines creation]\n"));
    for (const airline of airlines) {
        const exists = await getAirlineModel().findOne({_id: airline._id});
        if (!exists) {
            const {airline: a, password} = await AirlinesSer.createAirline(airline);
            await a.save();
        }
    }
}

