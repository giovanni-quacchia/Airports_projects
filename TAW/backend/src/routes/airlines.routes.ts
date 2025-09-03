import express from "express";
const router = express.Router();
import airlines from '../controllers/airlines.controller'

// Get All airlines
router.get("/", airlines.getAllAirlines);

// Get :id airline
router.get("/:id", airlines.getAirline);

// Create a new airline
router.post("/", airlines.newAirline);

// Delete airline
router.delete("/:id", airlines.deleteAirline);

module.exports = router;