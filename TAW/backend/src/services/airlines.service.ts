import Ar, {Airline} from '../models/airline';
import mongoose from 'mongoose';
import { validateLogin } from '../utils/auth.utils';

const auth = require('../utils/auth.utils')

async function logIn(data) {

    // Check login
    const query = validateLogin(data);
    let res = {}

    // Check credentials
    const airline = await Ar.getModel().findOne({mail: query.mail});
    if(!airline || !airline.checkPassword(query.password)) throw Error("Credentials not valid");
    
    // Update pw on first login
    if(airline.isFirstLogin){
        if(!query.newPassword) throw Error("Please provide a new password on first login");
        if(airline.checkPassword(query.newPassword)) throw Error("Please provide a new password");
        airline.setPassword(query.newPassword);
        airline.isFirstLogin = false;
        airline.save();
        res = {msg: "Password updated"}
    }

    // create JWT
    const token = auth.generateAccessToken({
        id: airline._id,
        mail: airline.mail,
        isAirline: true,
    });

    res = {...res, token: token, expireDays: 7};

    return res;
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
    const ar = Ar.newAirline(airline);
    // const pw = getRandomPassword(16);
    const pw = "password";
    ar.setPassword(pw);
    await ar.save();
    return {airline: ar, password: pw};
}

async function deleteAirline(id: string){
    return Ar.getModel().findByIdAndDelete(id).select("code PIVA name logo");
}

async function updateAirline(id: string, data: any){
    const parsedData: any = Ar.validatePut(data);

    const airline = await Ar.getModel().findById(id);

    if(!airline) throw Error("Airline not found");
    
    if(parsedData.password){
        airline.setPassword(parsedData.password);
        delete parsedData.password;
    }

    // Update other fields
    Object.assign(airline, parsedData);
    await airline.save();
    return {name: airline.name, code: airline.code, PIVA: airline.PIVA, logo: airline.logo};
}

export default {
    getAllAirlines,
    getAirline,
    createAirline,
    deleteAirline,
    updateAirline,
    logIn
}