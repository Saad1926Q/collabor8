import simpleGit from 'simple-git';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const cloneRepo = async (req, res) => {
  try {
    const { repoUrl } = req.body;

    if (!repoUrl) {
      return res.status(400).json({ error: "Repository URL is required" });
    }

    const repoName = repoUrl.split("/").pop().replace(".git", "");
    const targetDir = path.resolve(__dirname, "../cloned_repos", repoName);

    // Ensure parent directory exists
    const parentDir = path.dirname(targetDir);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
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
  try {
    const clonedReposDir = path.resolve(__dirname, "../cloned_repos");

    if (!fs.existsSync(clonedReposDir)) {
      return res.status(404).json({ error: "No cloned repositories found" });
    }

    const repoName = fs.readdirSync(clonedReposDir).find(name => 
      fs.statSync(path.join(clonedReposDir, name)).isDirectory()
    );

    if (!repoName) {
      return res.status(404).json({ error: "No repository found" });
    }

    const targetDir = path.join(clonedReposDir, repoName);

    const getFilesRecursively = (dir) => {
      return fs.readdirSync(dir, { withFileTypes: true })
        .filter(dirent => !dirent.name.startsWith('.'))
        .map(dirent => {
          const fullPath = path.join(dir, dirent.name);
          return dirent.isDirectory()
            ? { name: dirent.name, type: "folder", children: getFilesRecursively(fullPath) }
            : { name: dirent.name, type: "file", path: path.relative(targetDir, fullPath) }; // use relative paths
        });
    };

    const structure = getFilesRecursively(targetDir);
    res.json({ structure, repoName });
  } catch (error) {
    console.error("Error reading repo structure:", error);
    res.status(500).json({ error: "Failed to fetch repo structure" });
  }
};

const getFileContent = async (req, res) => {
  try {
    const { filePath } = req.query;

    const clonedReposDir = path.resolve(__dirname, "../cloned_repos");

    if (!fs.existsSync(clonedReposDir)) {
      return res.status(404).json({ error: "No cloned repositories found" });
    }

    const repoName = fs.readdirSync(clonedReposDir).find(name => 
      fs.statSync(path.join(clonedReposDir, name)).isDirectory()
    );

    if (!repoName) {
      return res.status(404).json({ error: "No repository found" });
    }

    const targetDir = path.join(clonedReposDir, repoName);
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

export { cloneRepo, getRepoStructure, getFileContent };
