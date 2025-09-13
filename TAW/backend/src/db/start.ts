const pc = require('picocolors')

// Models
import {getModel as getAirlineModel} from '../models/airline';
import {getModel as getAirplaneModel} from '../models/airplane';
import {getModel as getAirportsModel} from '../models/Airport';
import {getModel as getUserModel} from '../models/user';
import {getModel as getRouteModel} from '../models/route';
import {getModel as getFlightModel} from '../models/flight'
import {getModel as getTicketModel} from '../models/Ticket'
import {getModel as getPassengerModel} from '../models/passenger'


// Data
import { airlines, airplanes, airports, flights, passengers, routes, tickets, users } from "./data";

// Services
import AirlinesSer from '../services/airlines.service'
import AirplanesSer from '../services/airplanes.service'
import AirportsServ from '../services/airports.service';
import UsersServ from '../services/users.service'
import RoutesServ from '../services/routes.service'
import FlightServ from '../services/flights.service'
import Ticket from '../models/Ticket';
import Passenger from '../models/passenger'


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
            a.save();
        }
    }
}

export async function addAirplanes(airlines) {

    console.log(pc.green("\n[Airplanes creation]\n"));
    for (const airplane of airplanes) {
        const a = {
            ...airplane,
            airline: airlines.get(airplane.airline)
        }
        const exists = await getAirplaneModel().findOne({code: a.code});
        if (!exists) {
            const airDoc = await AirplanesSer.createAirplane(a);
            airDoc.save();
        }
    }
}

export async function addAirports() {
    console.log(pc.green("\n[Airports creation]\n"));
    for (const airport of airports) {
        const exists = await getAirportsModel().findOne(airport);
        if (!exists) {
            const a = await AirportsServ.createAirport(airport);
            a.save();
        }
    }
}

export async function addRoutes(airports: Map<string, any>) {
    console.log(pc.green("\n[Routes creation]\n"));
    for (const route of routes) {
        const r = {
            from: airports.get(route.from),
            to: airports.get(route.to)
        };
        const exists = await getRouteModel().findOne(r);
        if (!exists) {
            const routeDoc = await RoutesServ.createRoute(r);
        }
    }
}

export async function addFlights(routes, airlines, airplanes) {
    console.log(pc.green("\n[Flights creation]\n"));
    for (const flight of flights) {
        const { from, to } = flight.route;
        const f = {
            ...flight,
            route: routes.get(`${from}-${to}`),
            airline: airlines.get(flight.airline),
            airplane: airplanes.get(flight.airplane)
        };
        const exists = await getFlightModel().findOne({ code: f.code });
        if (!exists) {
            const flightDoc = await FlightServ.createFlight(f);
            flightDoc.save();
        }
    }
}

export async function addTickets(flights) {
    console.log(pc.green("\n[Tickets creation]\n"));
    for (const ticket of tickets) {
        const t = {
            ...ticket,
            flight: flights.get(`${ticket.flight}_${ticket.departure.getTime()}`)
        };
        delete t.departure; // remove departure
        const exists = await getTicketModel().findOne({ code: t.code });
        if (!exists) {
            const ticketDoc = Ticket.createTicket(t);
            await ticketDoc.save();
        }
    }
}

export async function addPassengers(tickets) {
    console.log(pc.green("\n[Passengers creation]\n"));
    for (const passenger of passengers) {

        const p = {
            ...passenger,
            ticket: tickets.get(passenger.ticket)
        };

        const key = passenger.CF ? "CF" : "passportNumber"
        const value = passenger.CF ? passenger.CF : passenger.passportNumber

        const exists = await getPassengerModel().findOne({[key]: value});
        if (!exists) {
            const passDoc = Passenger.createPassenger(p);
            await passDoc.save();
        }
    }
}