import express from "express";
const router = express.Router();
import passenger from '../controllers/passengers.controller'
import ticket from '../controllers/tickets.controller'

// Get All flights: ? [from, to, fromDate, toDate, airline]
// Date: year-month-day

// Get all passengers
router.get("/", passenger.getAllPassengers);

// Get :id passenger
router.get("/:id", passenger.getPassenger);

// Create a new passenger
router.post("/", passenger.createPassenger);

// Delete passenger
router.delete("/:id", passenger.deletePassenger);

// Update passenger
router.put("/:id", passenger.updatePassenger);

// Get tickets of a :id flight
// router.get("/:flightId/tickets", ticket.getAllTickets);

module.exports = router;