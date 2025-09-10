import Ar, {Airline} from '../models/airline';
import { getRandomPassword } from '../utils/utils';
import Us from '../models/user'
import mongoose from 'mongoose';

const auth = require('../utils/auth.utils')

async function logIn(data) {

    // Check login
    Us.validateLogin(data);
    const airline = await Ar.getModel().findOne({mail: data.mail});
    if(!airline || !airline.checkPassword(data.password)) throw Error("Credentials not valid");
    
    if(airline.isFirstLogin) throw Error("Please update your password on first login");

    // create JWT
    const token = auth.generateAccessToken({
        id: airline._id,
        mail: airline.mail,
        isAirline: true,
    });

    return {token: token, expireDays: 7};
}

// Add airlines (if not exist)
async function getAllAirlines(user, query) {

    Ar.validateSearch(query);
    let {name = ""} = query;
    const nameMatch = name ? { $regex: name, $options: "i" } : /.*/;

    const pipeline: any[] = [ { $match: { name: nameMatch } } ]

    // Keep mail:password info if Admin
    if(user?.isAdmin !== true){
        pipeline.push(
            { $project: {code: 1, PIVA: 1, name: 1, logo: 1} }
        )
    }

    return Ar.getModel().aggregate(pipeline);
}

async function getAirline(user, id: string){
    const pipeline: any[] = [ { $match: {"_id": new mongoose.Types.ObjectId(id)}}]

    if(user?.isAdmin !== true){
        pipeline.push(
            { $project: {code: 1, PIVA: 1, name: 1, logo: 1} }
        )
    }

    return Ar.getModel().aggregate(pipeline);
}

async function createAirline(airline: Partial<Airline>){
    const ar = await Ar.newAirline(airline);
    // const pw = getRandomPassword(16);
    const pw = "password";
    ar.setPassword(pw);
    await ar.save();
    return {airline: ar, password: pw};
}

async function deleteAirline(id: string){
    return Ar.getModel().findByIdAndDelete(id);
}

async function updateAirline(id: string, data: any){
    const parsedData = Ar.validatePut(data);

    const airline = await Ar.getModel().findById(id);

    // TODO: first password update
    if(parsedData.hasOwnProperty("password")){
        airline.setPassword(parsedData.password)
    }

    // return Ar.getModel().findByIdAndUpdate(id, parsedData, { new: true, runValidators: true });
}

export default {
    getAllAirlines,
    getAirline,
    createAirline,
    deleteAirline,
    updateAirline,
    logIn
}