import express from "express";
const router = express.Router();
const users = require("../controllers/users.controller");
const auth = require('../utils/auth.utils')

// Sign up
router.post("/", users.createUser);

// Log in
router.post("/sessions", users.logIn);

// Get All users: only admin
router.get("/", auth.authenticateToken, auth.checkAdmin, users.getAllUsers);

// Get :id user: only admin or specific user
router.get("/:id", auth.authenticateToken, auth.checkUserId, users.getUser);

// Delete user: only admin or user itself
router.delete("/:id", auth.authenticateToken, auth.checkUserId, users.deleteUser);

// Update User: only admin or user itself
router.put("/:id", auth.authenticateToken, auth.checkUserId, users.updateUser);

module.exports = router;