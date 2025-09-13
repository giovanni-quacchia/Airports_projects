import express from "express";
const router = express.Router();
const auth = require('../utils/auth.utils')
import airport from '../controllers/airports.controller'

// Get All airport: ? [q]
// q: Search fro name, city, code, country LIKE %q%
router.get("/", airport.getAllAirports);

// Get :id Airport
router.get("/:id", airport.getAirport);

// Create a new Airport: admin or airlines
router.post("/", auth.authenticateToken, auth.checkAirline, airport.createAirport);

// Delete Airport: only admin
router.delete("/:id", auth.authenticateToken, auth.checkAdmin, airport.deleteAirport);

// Update Airport
router.put("/:id", auth.authenticateToken, auth.checkAdmin, airport.updateAirport);

module.exports = router;