import express from "express";
const router = express.Router();
import passenger from '../controllers/passengers.controller'
const auth = require('../utils/auth.utils')

// Get All passengers: ? [name, surname, CF, passportNumber, sortBy, order]
// sortBy: name, surname, seat, CF, passportNumber

router.get("/", auth.authenticateToken, passenger.getAllPassengers);

// Get :id passenger
router.get("/:id", auth.authenticateToken, passenger.getPassenger);

// Create a new passenger
router.post("/", auth.authenticateToken, passenger.createPassenger);

// Delete passenger
router.delete("/:id", auth.authenticateToken, passenger.deletePassenger);

// Update passenger
router.put("/:id", auth.authenticateToken, passenger.updatePassenger);

module.exports = router;