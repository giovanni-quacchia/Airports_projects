import express from "express";
const router = express.Router();
import route from '../controllers/routes.controller'

// Get All route
router.get("/", route.getAllRoutes);

// Get :id route
router.get("/:id", route.getRoute);

// Create a new route
router.post("/", route.createRoute);

// Delete route
router.delete("/:id", route.deleteRoute);

// Update route
router.put("/:id", route.updateRoute);

module.exports = router;