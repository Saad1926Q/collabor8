import express from "express";
import { cloneRepo, getRepoStructure, getFileContent } from "../controllers/gitController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Repository management routes
router.post("/clone", cloneRepo);

// Room-specific repository routes
router.get("/structure/:roomId", getRepoStructure);
router.get("/file/:roomId", getFileContent);

export default router;
