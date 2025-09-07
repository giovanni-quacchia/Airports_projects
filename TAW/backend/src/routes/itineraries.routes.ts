import express from "express";
const router = express.Router();
import itinerary from '../controllers/itineraries.controller'

// Get All flights: ? [from, to fromDate, toDate]
// Date: year-month-day

router.get("/", itinerary.getAllItineraries);

module.exports = router;