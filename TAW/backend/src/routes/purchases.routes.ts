import express from "express";
const router = express.Router();
import purchase from '../controllers/purchases.controller'
import passengers from '../controllers/passengers.controller'
const auth = require('../utils/auth.utils')

// Get All purchases: ? [sortBy, order]
// sortBy: price, quantity, date
// only admin

router.get("/", auth.authenticateToken, auth.checkAdmin, purchase.getAllPurchases);

// Get :id purchase: only admin
router.get("/:id",auth.authenticateToken, auth.checkAdmin, purchase.getPurchase);

// Create a new purchase: admin or user
router.post("/", auth.authenticateToken, auth.checkUser, purchase.createPurchase);

// Delete purchase: admin / user
router.delete("/:id", auth.authenticateToken, auth.checkUser, purchase.deletePurchase);

// Update purchase: only admin
router.put("/:id", auth.authenticateToken, auth.checkAdmin, purchase.updatePurchase);

// Get passengers of a purchase: only admin and user owning the purchase
router.get("/:purchaseId/passengers", auth.authenticateToken, passengers.getAllPassengers);

module.exports = router;