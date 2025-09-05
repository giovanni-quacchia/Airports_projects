import express from "express";
const router = express.Router();
const users = require("../controllers/users.controller");

// Sign up
router.post("/sign-up", users.createUser);

// Log in
router.post("/log-in", users.logIn);

// Get All users
router.get("/", users.getAllUsers);

// Get :id user
router.get("/:id", users.getUser);

// Delete user
router.delete("/:id", users.deleteUser);

// Update User
router.put("/:id", users.updateUser);

// Delete User
router.delete("/", users.deleteUser);

module.exports = router;