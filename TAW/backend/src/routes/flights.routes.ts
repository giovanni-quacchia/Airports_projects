import express from "express";
const router = express.Router();
import flight from '../controllers/flights.controller'
import ticket from '../controllers/tickets.controller'
import passenger from '../controllers/passengers.controller'
const auth = require('../utils/auth.utils')

// Get All flights: ? [from, to, fromDate, toDate, airline, airplane, code, sortBy, order, statistics]
// sortBy: departure, arrival, duration
// Date: year-month-day

// Get all flights
router.get("/", flight.getAllFlights);

// Get :id flight
router.get("/:id", flight.getFlight);

// Create a new flight: airline or admin
router.post("/", auth.authenticateToken, auth.checkAirline, flight.createFlight);

// Delete flight: specific airline or admin
router.delete("/:id", auth.authenticateToken, auth.checkAirline, flight.deleteFlight);

// Update flight: admin or specific airline
router.put("/:id", auth.authenticateToken, auth.checkAirline, flight.updateFlight);

// Get tickets of a :id flight
router.get("/:flightId/tickets", ticket.getAllTickets);

// Get passengers of a :id flight
router.get("/:flightId/passengers", auth.authenticateToken, auth.checkAirline, passenger.getAllPassengers);



module.exports = router;