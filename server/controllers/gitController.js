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

const getRepoStructure = (req, res) => {
  const clonedReposDir = path.join(__dirname, "../cloned_repos");

  const repoName = fs.readdirSync(clonedReposDir).find((name) => 
    fs.statSync(path.join(clonedReposDir, name)).isDirectory()
  );
  
  if (!repoName) {
    return res.status(404).json({ error: "No repository found" });
  }
    const targetDir = path.join(__dirname, "../cloned_repos", repoName); // Use dynamic repo name

  const getFilesRecursively = (dir) => {
    return fs.readdirSync(dir, { withFileTypes: true })
      .filter(dirent => !dirent.name.startsWith(".")) // Ignore hidden files (like .git)
      .map(dirent => {
        const fullPath = path.join(dir, dirent.name);
        return dirent.isDirectory()
          ? { name: dirent.name, type: "folder", children: getFilesRecursively(fullPath) }
          : { name: dirent.name, type: "file", path: fullPath };
      });
  };

  try {
    if (!fs.existsSync(targetDir)) {
      return res.status(404).json({ error: "Repository not found" });
    }

    const structure = getFilesRecursively(targetDir);
    res.json({ structure, repoName });
  } catch (error) {
    console.error("Error reading repo structure:", error);
    res.status(500).json({ error: "Failed to fetch repo structure" });
  }
};
  
  // Get file content
  const getFileContent = async (req, res) => {
    try {
      const clonedReposDir = path.join(__dirname, "../cloned_repos");

      const repoName = fs.readdirSync(clonedReposDir).find((name) => 
        fs.statSync(path.join(clonedReposDir, name)).isDirectory()
      );
      
      if (!repoName) {
        return res.status(404).json({ error: "No repository found" });
      }
      const { filePath } = req.query;
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