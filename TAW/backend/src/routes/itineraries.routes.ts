import express from "express";
const router = express.Router();
import itinerary from '../controllers/itineraries.controller'

// Get All flights: ? [from, to, fromDate, toDate, onlyDirect, maxStops, airline]
// Date: year-month-day
// airline: just one of the flights

router.get("/", itinerary.getAllItineraries);

module.exports = router;