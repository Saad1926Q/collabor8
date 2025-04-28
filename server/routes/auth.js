import express from "express";
import { register, login, forgotPassword, getUserProfile, deleteAccount } from "../controllers/authController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);

// Protected routes
router.get("/me", authenticateToken, getUserProfile);
router.delete("/delete-account", authenticateToken, deleteAccount);

export default router;
