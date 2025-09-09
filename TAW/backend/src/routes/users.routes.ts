import express from "express";
const router = express.Router();
const users = require("../controllers/users.controller");
const auth = require('../utils/auth.utils')

// Sign up
router.post("/", users.createUser);

// Log in
router.post("/sessions", users.logIn);

// Get All users
router.get("/", auth.authenticateToken, auth.checkAdmin, users.getAllUsers);

// Get :id user
router.get("/:id", users.getUser);

// Delete user
// TODO: only user can delete its account
router.delete("/:id", auth.authenticateToken, users.deleteUser);

// Update User
router.put("/:id", auth.authenticateToken, users.updateUser);

module.exports = router;