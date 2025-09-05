const pc = require('picocolors')

// Models
import {getModel as getAirlineModel} from '../models/Airline';
import {getModel as getAirplaneModel} from '../models/airplane';
import {getModel as getAirportsModel} from '../models/Airport';
import {getModel as getUserModel} from '../models/user';
import {getModel as getRouteModel} from '../models/route';
import {getModel as getFlightModel} from '../models/flight'

// Data
import { airlines, airplanes, airports, flights, routes, users } from "./data";

// Services
import AirlinesSer from '../services/airlines.service'
import AirplanesSer from '../services/airplanes.service'
import AirportsServ from '../services/airports.service';
import UsersServ from '../services/users.service'
import RoutesServ from '../services/routes.service'
import mongoose from 'mongoose';


export async function AddUsers(){
    console.log(pc.green("\n[Users creation]\n"));
    for(const user of users){
        getUserModel().findOne({mail: user.mail}).then((exists) => {
            if(!exists){
                UsersServ.createUser(user);
            }
        })
    }
}

export async function AddAirlines() {
    console.log(pc.green("\n[Airlines creation]\n"));
    for(const airline of airlines){
        getAirlineModel().findOne(airline).then((exists) => {
            if(!exists){
                AirlinesSer.createAirline(airline);
            }
        })
    }
}

export async function addAirplanes(){
    console.log(pc.green("[Airplanes creation]\n"));
    for(const airplane of airplanes){
        getAirplaneModel().findOne(airplane).then((exists) => {
            if(!exists){
                AirplanesSer.createAirplane(airplane);
            }
        })
    }
}

export async function addAirports(){
    console.log(pc.green("[Airports creation]\n"));
    for(const airport of airports){
        getAirportsModel().findOne(airport).then((exists) => {
            if(!exists){
                AirportsServ.createAirport(airport);
            }
        })
    }
}

export async function addRoutes(airports){
    console.log(pc.green("[Routes creation]\n"));
    
    for(const route of routes){
        // use airpot's _ids
        const r = {
            from: airports.get(route.from), 
            to: airports.get(route.to)
        }

        getRouteModel().findOne(r).then((exists) => {
            if(!exists){
                RoutesServ.createRoute(r);
            }
        })
    }
}

export async function addFlights(routes, airlines){
    console.log(pc.green("[Flights creation]\n"));
    
    for(const flight of flights){
        // use airpot's _ids
        const f = {
            date: flight.date,
            duration: flight.duration
            route: airports.get(flight.route), 
            airline: airports.get(flight.to)
        }

        getFlightModel().findOne(r).then((exists) => {
            if(!exists){
                RoutesServ.createRoute(r);
            }
        })
    }
}
}