import express from "express";
const router = express.Router();
import flight from '../controllers/flights.controller'

// Get All flights
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