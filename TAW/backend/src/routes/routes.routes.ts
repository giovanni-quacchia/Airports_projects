import express from "express";
const router = express.Router();
import route from '../controllers/routes.controller'
const auth = require('../utils/auth.utils')

// Get All route: ? [from, to]
router.get("/", route.getAllRoutes);

// Get :id route
router.get("/:id", route.getRoute);

// Create a new route: airline or admin
router.post("/", auth.authenticateToken, auth.checkAirline, route.createRoute);

// Delete route: only admin
router.delete("/:id", auth.authenticateToken, auth.checkAdmin, route.deleteRoute);

// Update route: only admin
router.put("/:id", auth.authenticateToken, auth.checkAdmin, route.updateRoute);

module.exports = router;