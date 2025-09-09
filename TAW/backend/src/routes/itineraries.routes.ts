import express from "express";
const router = express.Router();
import itinerary from '../controllers/itineraries.controller'

// Get All flights: ? [from, to, fromDate, toDate, onlyDirect, maxStops, airline, sortBy, order]
// Date: year-month-day
// airline: just one of the flights
// sortBy: departure, arrival, duration, numStops

router.get("/", itinerary.getAllItineraries);

module.exports = router;