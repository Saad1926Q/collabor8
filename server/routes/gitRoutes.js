const express = require("express");
const { cloneRepo,getRepoStructure,getFileContent } = require("../controllers/gitController");

const router = express.Router();

router.post("/clone", cloneRepo);

router.get("/structure", getRepoStructure);

// Route to get file content
router.get("/file", getFileContent);


module.exports = router;
