import express from "express";
const router = express.Router();
import airplanes from '../controllers/airplanes.controller'

// Get All airplanes
router.get("/", airplanes.getAllAirplanes);

// Get :id airplane
router.get("/:id", airplanes.getAirplane);

// Create a new airplane
router.post("/", airplanes.createAirplane);

// Delete airplane
router.delete("/:id", airplanes.deleteAirplane);

// Update airplane
router.put("/:id", airplanes.updateAirplane);

module.exports = router;