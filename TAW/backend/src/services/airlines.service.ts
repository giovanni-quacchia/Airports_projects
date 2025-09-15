import Ar, {Airline} from '../models/Airline';
import mongoose from 'mongoose';
import { AppError } from '../models/AppError';

const auth = require('../utils/auth.utils')

async function logIn(query) {

    // Check login
    let res = {}

    // Check credentials
    const airline = await Ar.getModel().findOne({mail: query.mail});
    if(!airline || !airline.checkPassword(query.password)) throw new AppError("Credentials not valid", 4005);
    
    // Update pw on first login
    if(airline.isFirstLogin){
        
        // Check new password
        if(!query.newPassword) throw new AppError("Please provide a new password on first login", 4005);
        if(query.password === query.newPassword) throw new AppError("Please provide a new password", 4005);
        
        airline.setPassword(query.newPassword);
        airline.isFirstLogin = false;
        await airline.save();

        res = {msg: "Password updated"}
    }

    // create JWT
    const token = auth.generateAccessToken({
        id: airline._id,
        mail: airline.mail,
        isAirline: true,
    });

    return {...res, token: token, expireDays: 7};
}

// Add airlines (if not exist)
async function getAllAirlines(user, query) {

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

async function getAirline(id, user){
    const pipeline: any[] = [ { $match: {"_id": new mongoose.Types.ObjectId(id)}}]

    // Keep mail:password info if Admin, only mail if specific Airline
    if(user?.isAdmin !== true){
        pipeline.push(
            { $project: {code: 1, PIVA: 1, name: 1, logo: 1, mail: user?.id === id ? 1 : "$$REMOVE"} }
        )
    }

    const res = Ar.getModel().aggregate(pipeline);
    if(!res) throw new AppError("Airline not found", 4004);
    return res;
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

async function updateAirline(id: string, query: any, user){

    const airline = await Ar.getModel().findById(id);
    if(!airline) throw new AppError("Airline not found", 4004);
    
    // Change password
    if(query.newPassword){
        if(!airline.checkPassword(query.password)) throw new AppError("Invalid password", 4005);
        
        if(query.password === query.newPassword) throw new AppError("New password must be different from the old one", 4005);

        airline.setPassword(query.newPassword);

        delete query.password;
        delete query.newPassword;
    }

    // Only admin can change mail
    if(query.mail && !user?.isAdmin) throw new AppError("Only admin can change airline mail", 4005);

    // Update other fields
    Object.assign(airline, query);
    await airline.save();

    const projection = {name: airline.name, code: airline.code, PIVA: airline.PIVA, logo: airline.logo};

    if(user?.isAdmin) return airline;
    else if (user?.id === id) return {...projection, mail: airline.mail};
    else return projection;
}

export default {
    getAllAirlines,
    getAirline,
    createAirline,
    deleteAirline,
    updateAirline,
    logIn
}