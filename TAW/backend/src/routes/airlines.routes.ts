import express from "express";
const router = express.Router();

import airlines from '../controllers/airlines.controller'
import airplanes from '../controllers/airplanes.controller'
import flights from '../controllers/flights.controller'
import tickets from '../controllers/tickets.controller'
import routes from '../controllers/routes.controller'

const auth = require('../utils/auth.utils')

// Log in
router.post("/sessions", airlines.logIn);

// Get All airlines
// Only admin can view all info
router.get("/", auth.optionalCheckToken, airlines.getAllAirlines);

// Get :id airline
// Only admin can view all info
router.get("/:id", auth.optionalCheckToken, airlines.getAirline);

// Create a new airline
// Only the admin creates new airlines
router.post("/", auth.authenticateToken, auth.checkAdmin, airlines.createAirline);

// Delete airline: only admin
router.delete("/:id", auth.authenticateToken, auth.checkAdmin, airlines.deleteAirline);

// Update airline: only admin and specific airline
router.put("/:id", auth.authenticateToken, auth.checkAirlineId, airlines.updateAirline);

// Get airplanes of :id airline
router.get("/:airlineId/airplanes", auth.optionalCheckToken, airplanes.getAllAirplanes);

// Get flights of :id airline
router.get("/:airlineId/flights", auth.optionalCheckToken, flights.getAllFlights);

// Get tickets of :id airline
router.get("/:airlineId/tickets", tickets.getAllTickets);

// Get routes served by :id airline
router.get("/:airlineId/routes", auth.optionalCheckToken, routes.getAllRoutes);


module.exports = router;