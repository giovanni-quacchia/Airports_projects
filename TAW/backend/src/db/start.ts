const pc = require('picocolors')

// Models
import {getModel as getAirlineModel} from '../models/airline';
import {getModel as getAirplaneModel} from '../models/airplane';
import {getModel as getAirportsModel} from '../models/Airport';
import {getModel as getUserModel} from '../models/user';
import {getModel as getRouteModel} from '../models/route';
import {getModel as getFlightModel} from '../models/flight'
import {getModel as getTicketModel} from '../models/Ticket'

// Data
import { airlines, airplanes, airports, flights, routes, tickets, users } from "./data";

// Services
import AirlinesSer from '../services/airlines.service'
import AirplanesSer from '../services/airplanes.service'
import AirportsServ from '../services/airports.service';
import UsersServ from '../services/users.service'
import RoutesServ from '../services/routes.service'
import FlightServ from '../services/flights.service'
import TicketServ from '../services/tickets.service'
import Ticket from '../models/Ticket';


export async function AddUsers(){
    console.log(pc.green("\n[Users creation]\n"));
    for(const user of users){
        const exists = await getUserModel().findOne({mail: user.mail});
        if(!exists){
            let u = await UsersServ.createUser(user);
            u.save();
        }
    }
}

export async function AddAirlines() {
    console.log(pc.green("\n[Airlines creation]\n"));
    for (const airline of airlines) {
        const exists = await getAirlineModel().findOne(airline);
        if (!exists) {
            const [a, pw] = await AirlinesSer.createAirline(airline);
            a.save();
        }
    }
}

export async function addAirplanes() {
    console.log(pc.green("\n[Airplanes creation]\n"));
    for (const airplane of airplanes) {
        const exists = await getAirplaneModel().findOne(airplane);
        if (!exists) {
            const a = await AirplanesSer.createAirplane(airplane);
            a.save();
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

export async function addRoutes(airportsMap: Map<string, any>) {
    console.log(pc.green("\n[Routes creation]\n"));
    for (const route of routes) {
        const r = {
            from: airportsMap.get(route.from),
            to: airportsMap.get(route.to)
        };
        const exists = await getRouteModel().findOne(r);
        if (!exists) {
            const routeDoc = await RoutesServ.createRoute(r);
            routeDoc.save();
        }
    }
}

export async function addFlights(routes, airlines) {
    console.log(pc.green("\n[Flights creation]\n"));
    for (const flight of flights) {
        const { from, to } = flight.route;
        const f = {
            ...flight,
            route: routes.get(`${from}-${to}`),
            airline: airlines.get(flight.airline)
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
            flight: flights.get(ticket.flight)
        };
        const exists = await getTicketModel().findOne({ type: t.type, flight: t.flight });
        if (!exists) {
            const ticketDoc = Ticket.createTicket(t);
            await ticketDoc.save();
        }
    }
}