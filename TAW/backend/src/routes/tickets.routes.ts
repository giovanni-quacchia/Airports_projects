import express from "express";
const router = express.Router();
import ticket from '../controllers/tickets.controller'

// Get All tickets: ? [type, minPrice, maxPrice, minQuantity, maxQuantity, from, to, sortyBy, order]
// sortBy: price, quantity, type

router.get("/", ticket.getAllTickets);

// Get :id ticket
router.get("/:id", ticket.getTicket);

// Create a new ticket
router.post("/", ticket.createTicket);

// Delete ticket
router.delete("/:id", ticket.deleteTicket);

// Update ticket
router.put("/:id", ticket.updateTicket);

module.exports = router;