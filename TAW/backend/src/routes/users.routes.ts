import express from "express";
const router = express.Router();
const usersController = require("../controllers/users.controller");

// Sign up
router.post("/sign-up", usersController.signUp);

// Log in
router.post("/log-in", usersController.logIn);

// Delete user
router.delete("/", usersController.deleteUser);

module.exports = router;