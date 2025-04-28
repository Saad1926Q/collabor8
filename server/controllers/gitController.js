import simpleGit from 'simple-git';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import db from '../models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const Room = db.Room;
const RoomMember = db.RoomMember;

const cloneRepo = async (req, res) => {
  try {
    const { repoUrl, roomId } = req.body;
    const userId = req.user.userId;

    if (!repoUrl) {
      return res.status(400).json({ error: "Repository URL is required" });
    }

    // If roomId is provided, verify user has access to the room
    if (roomId) {
      const roomMember = await RoomMember.findOne({
        where: {
          room_id: roomId,
          user_id: userId
        }
      });

      if (!roomMember) {
        return res.status(403).json({ error: "You don't have access to this room" });
      }

      const room = await Room.findByPk(roomId);
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }
    }

    const repoName = repoUrl.split("/").pop().replace(".git", "");
    const targetDir = path.resolve(__dirname, "../cloned_repos", `${userId}_${repoName}`);

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

const getRepoStructure = async (req, res) => {
  try {
    const userId = req.user.userId;
    const roomId = req.params.roomId;

    // Verify user has access to the room
    if (roomId) {
      const roomMember = await RoomMember.findOne({
        where: {
          room_id: roomId,
          user_id: userId
        }
      });

      if (!roomMember) {
        return res.status(403).json({ error: "You don't have access to this room" });
      }

      const room = await Room.findByPk(roomId);
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }

      // Use room's name as the repository name
      const repoName = room.name;
      
      // Get the leader's directory first (original repository location)
      const leaderDir = path.resolve(__dirname, "../cloned_repos", `${room.leader_id}_${repoName}`);
      
      // If user is not the owner, check if leader's repo exists instead
      let targetDir = path.resolve(__dirname, "../cloned_repos", `${userId}_${repoName}`);
      
      // If user's repo doesn't exist but they're a member, use the leader's repo
      if (!fs.existsSync(targetDir) && fs.existsSync(leaderDir)) {
        targetDir = leaderDir;
      }
      
      if (!fs.existsSync(targetDir)) {
        return res.status(404).json({ error: "Repository not found", structure: [] });
      }

      const getFilesRecursively = (dir, rootDir) => {
        return fs.readdirSync(dir, { withFileTypes: true })
          .filter(dirent => !dirent.name.startsWith('.'))
          .map(dirent => {
            const fullPath = path.join(dir, dirent.name);
            return dirent.isDirectory()
              ? { name: dirent.name, type: "folder", children: getFilesRecursively(fullPath, rootDir) }
              : { name: dirent.name, type: "file", path: path.relative(rootDir, fullPath) };
          });
      };

      const structure = getFilesRecursively(targetDir, targetDir);
      res.json({ structure, repoName });
    } else {
      return res.status(400).json({ error: "Room ID is required" });
    }
  } catch (error) {
    console.error("Error reading repo structure:", error);
    res.status(500).json({ error: "Failed to fetch repo structure" });
  }
};


const getFileContent = async (req, res) => {
  try {
    const { filePath } = req.query;
    const userId = req.user.userId;
    const roomId = req.params.roomId;

    // Verify user has access to the room
    if (roomId) {
      const roomMember = await RoomMember.findOne({
        where: {
          room_id: roomId,
          user_id: userId
        }
      });

      if (!roomMember) {
        return res.status(403).json({ error: "You don't have access to this room" });
      }

      const room = await Room.findByPk(roomId);
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }

      // Use room's name as the repository name
      const repoName = room.name;
      
      // Get the leader's directory first (original repository location)
      const leaderDir = path.resolve(__dirname, "../cloned_repos", `${room.leader_id}_${repoName}`);
      
      // If user is not the owner, check if leader's repo exists instead
      let targetDir = path.resolve(__dirname, "../cloned_repos", `${userId}_${repoName}`);
      
      // If user's repo doesn't exist but they're a member, use the leader's repo
      if (!fs.existsSync(targetDir) && fs.existsSync(leaderDir)) {
        targetDir = leaderDir;
      }
      
      if (!fs.existsSync(targetDir)) {
        return res.status(404).json({ error: "Repository not found" });
      }

      const fileFullPath = path.join(targetDir, filePath);

      if (!fs.existsSync(fileFullPath)) {
        return res.status(404).json({ error: "File not found" });
      }

      const fileContent = fs.readFileSync(fileFullPath, "utf-8");
      res.json({ content: fileContent });
    } else {
      return res.status(400).json({ error: "Room ID is required" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch file content" });
  }
};

export { cloneRepo, getRepoStructure, getFileContent };
