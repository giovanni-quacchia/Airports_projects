const mongoose = require('mongoose');
import {getModel as getAirlineModel} from '../models/Airline';
import {getModel as getAirplaneModel} from '../models/airplane';
import { airlines, airplanes } from "./data";
import AirlinesSer from '../services/airlines.service'
import AirplanesSer from '../services/airplanes.service'

// Add airlines (if not exist)
export async function AddAirlines() {
    console.log("Airline creation\n");
    for(const airline of airlines){
        getAirlineModel().findOne(airline).then((exists) => {
            if(!exists){
                AirlinesSer.createAirline(airline);
            }
        })
        
    }
}

export async function addAirplanes(){
    console.log("Airplanes creation\n");
    for(const airplane of airplanes){
        getAirplaneModel().findOne(airplane).then((exists) => {
            if(!exists){
                AirplanesSer.createAirplane(airplane);
            }
        })
    }

}