const mongoose = require('mongoose');
import Airline from '../models/airline';
import { airlines } from "./data";
import ser from '../services/airlines.service'
import crypto = require('crypto');

// Add airlines (if not exist)
export async function AddAirlines() {
    console.log("Airline creation\n");
    for(const airline of airlines){
        Airline.getModel().findOne(airline).then((exists) => {
            if(!exists){
                ser.newAirline(airline);
            }
        })
        
    }
}