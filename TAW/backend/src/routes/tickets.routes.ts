import express from "express";
const router = express.Router();
import ticket from '../controllers/tickets.controller'
const auth = require('../utils/auth.utils')

// Get All tickets: ? [type, minPrice, maxPrice, minQuantity, maxQuantity, from, to, sortyBy, order]
// sortBy: price, quantity, type, code

router.get("/", ticket.getAllTickets);

// Get :id ticket
router.get("/:id", ticket.getTicket);

// Create a new ticket: admin or airline
router.post("/", auth.authenticateToken, auth.checkAirline, ticket.createTicket);

// Delete ticket: admin or airline
router.delete("/:id", auth.authenticateToken, auth.checkAirline, ticket.deleteTicket);

// Update ticket: admin or airline
router.put("/:id", auth.authenticateToken, auth.checkAirline, ticket.updateTicket);

module.exports = router;