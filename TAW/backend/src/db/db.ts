const mongoose = require('mongoose');

const DBname = "AirplanesDB"
const mongoUri = "mongodb://mongo:27017/" + DBname;

import User from '../models/user';
import { newUser } from '../models/user';

mongoose.connect(mongoUri)
.then(() => {
    console.log("Connected to MongoDB");

    return User.getModel().findOne({username: "admin"})
})
// Create admin
.then((adminExists) => {
    if(!adminExists){
        const admin = newUser({
            username: "admin",
        });
        admin.setPassword("admin");
        admin.setAdmin();
        return admin.save();
    }
})
.catch(err => console.error('MongoDB connection error:', err));