const mongoose = require('mongoose');

const DBname = "AirplanesDB"
const mongoUri = "mongodb://localhost:27017/" + DBname;

import User from '../models/user';
import { newUser } from '../models/user';

export async function connectDB(){
    mongoose.connect(mongoUri)
    .then(() => {
        console.log("Connected to MongoDB");

        return User.getModel().findOne({mail: "admin@gmail.com"})
    })
    // Create admin
    .then((adminExists) => {
        if(!adminExists){
            const admin = newUser({
                mail: "admin@gmail.com",
            });
            admin.setPassword("admin");
            admin.setAdmin();
            console.log("Admin created")
            return admin.save();
        }
    })
    .catch((err: string) => console.error('MongoDB connection error:', err));
}

