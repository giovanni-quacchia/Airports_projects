import express from "express";
const router = express.Router();
import passenger from '../controllers/passengers.controller'
import ticket from '../controllers/tickets.controller'

// Get All passengers: ? [name, surname, CF, passportNumber, sortBy, order]
// sortBy: name, surname, seat, CF, passportNumber

router.get("/", passenger.getAllPassengers);

// Get :id passenger
router.get("/:id", passenger.getPassenger);

// Create a new passenger
router.post("/", passenger.createPassenger);

// Delete passenger
router.delete("/:id", passenger.deletePassenger);

// Update passenger
router.put("/:id", passenger.updatePassenger);

module.exports = router;