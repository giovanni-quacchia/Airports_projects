import express from "express";
const router = express.Router();
import flight from '../controllers/flights.controller'
import ticket from '../controllers/tickets.controller'
import passenger from '../controllers/passengers.controller'

// Get All flights: ? [from, to, fromDate, toDate, airline]
// Date: year-month-day

// Get all flights
router.get("/", flight.getAllFlights);

// Get :id flight
router.get("/:id", flight.getFlight);

// Create a new flight
router.post("/", flight.createFlight);

// Delete flight
router.delete("/:id", flight.deleteFlight);

// Update flight
router.put("/:id", flight.updateFlight);

// Get tickets of a :id flight
router.get("/:flightId/tickets", ticket.getAllTickets);

// Get passengers of a :id flight
router.get("/:flightId/passengers", passenger.getAllPassengers);

module.exports = router;