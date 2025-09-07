import express from "express";
const router = express.Router();
import flight from '../controllers/flights.controller'

// Get All flights: ? [from, to fromDate, toDate]
// Date: year-month-day

router.get("/", flight.getAllFlights);

// Get :id flight
router.get("/:id", flight.getFlight);

// Create a new flight
router.post("/", flight.createFlight);

// Delete flight
router.delete("/:id", flight.deleteFlight);

// Update flight
router.put("/:id", flight.updateFlight);

module.exports = router;