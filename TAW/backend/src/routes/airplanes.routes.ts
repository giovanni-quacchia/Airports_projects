import express from "express";
const router = express.Router();
import airplanes from '../controllers/airplanes.controller'
const auth = require('../utils/auth.utils')

// Get All airplanes
router.get("/", airplanes.getAllAirplanes);

// Get :id airplane
router.get("/:id", airplanes.getAirplane);

// Create a new airplane: airline or admin
router.post("/", auth.authenticateToken, auth.checkAirline, airplanes.createAirplane);

// Delete airplane: only admin
router.delete("/:id", auth.authenticateToken, auth.checkAdmin, airplanes.deleteAirplane);

// Update airplane: only admin
router.put("/:id", auth.authenticateToken, auth.checkAdmin, airplanes.updateAirplane);

module.exports = router;