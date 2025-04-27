import express from "express";
import { cloneRepo, getRepoStructure, getFileContent } from "../controllers/gitController.js";

const router = express.Router();

router.post("/clone", cloneRepo);

router.get("/structure", getRepoStructure);

// Route to get file content
router.get("/file", getFileContent);


export default router;