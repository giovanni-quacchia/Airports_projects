import express from "express";
const router = express.Router();
import airport from '../controllers/airports.controller'

// Get All airport
router.get("/", airport.getAllAirports);

// Get :id Airport
router.get("/:id", airport.getAirport);

// Create a new Airport
router.post("/", airport.createAirport);

// Delete Airport
router.delete("/:id", airport.deleteAirport);

// Update Airport
router.put("/:id", airport.updateAirport);

module.exports = router;