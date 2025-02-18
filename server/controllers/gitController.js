const simpleGit = require("simple-git");
const path = require("path");
const fs = require("fs");

const cloneRepo = async (req, res) => {
  try {
    const { repoUrl } = req.body;

    if (!repoUrl) {
      return res.status(400).json({ error: "Repository URL is required" });
    }

    const repoName = repoUrl.split("/").pop().replace(".git", ""); // Extract repo name
    const targetDir = path.join(__dirname, "../cloned_repos", repoName);

    // Ensure directory exists
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const git = simpleGit();

    // Clone repository
    await git.clone(repoUrl, targetDir);

    res.json({ message: `Repository cloned successfully into ${targetDir}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to clone repository" });
  }
};

const getRepoStructure = async (req, res) => {
    try {
      const { repoName } = req.params;
      const targetDir = path.join(__dirname, "../cloned_repos", repoName);
  
      if (!fs.existsSync(targetDir)) {
        return res.status(404).json({ error: "Repository not found" });
      }
  
      const getStructure = (dir) => {
        const files = fs.readdirSync(dir);
        return files.map((file) => {
          const filePath = path.join(dir, file);
          const stat = fs.statSync(filePath);
          if (stat.isDirectory()) {
            return { name: file, type: "folder", path: filePath, children: getStructure(filePath) };
          } else {
            return { name: file, type: "file", path: filePath };
          }
        });
      };
  
      const structure = getStructure(targetDir);
      res.json({ structure });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch repository structure" });
    }
  };
  
  // Get file content
  const getFileContent = async (req, res) => {
    try {
      const { repoName, filePath } = req.query;
      const targetDir = path.join(__dirname, "../cloned_repos", repoName);
      const fileFullPath = path.join(targetDir, filePath);
  
      if (!fs.existsSync(fileFullPath)) {
        return res.status(404).json({ error: "File not found" });
      }
  
      const fileContent = fs.readFileSync(fileFullPath, "utf-8");
      res.json({ content: fileContent });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch file content" });
    }
  };
  
  module.exports = { cloneRepo, getRepoStructure, getFileContent };