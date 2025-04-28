import db from '../models/index.js';
import dotenv from 'dotenv';
import { customAlphabet } from 'nanoid';
import simpleGit from 'simple-git';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const Room = db.Room;
const RoomMember = db.RoomMember;
const User = db.User;

export const createRoom = async (req, res) => {
    const { room_name, repo_url } = req.body;
    
    // Get user ID from the authenticated request
    const userId = req.user.userId;

    // Extract project name from repo URL
    const repoName = repo_url.split("/").pop().replace(".git", "");

    try {
        // Check if user exists
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if room with same name already exists for this user
        const existingRoom = await Room.findOne({
            where: {
                name: repoName,
                leader_id: userId
            }
        });

        if (existingRoom) {
            return res.status(400).json({ message: "A room with this repository already exists" });
        }

        // Clone the repository
        const targetDir = path.resolve(__dirname, "../cloned_repos", `${userId}_${repoName}`);

        // Ensure parent directory exists
        const parentDir = path.dirname(targetDir);
        if (!fs.existsSync(parentDir)) {
            fs.mkdirSync(parentDir, { recursive: true });
        }

        const git = simpleGit();

        // Clone repository
        await git.clone(repo_url, targetDir);

        // Generate a unique invite ID for the room
        const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 8);
        const inviteId = nanoid();

        // Create room in database
        const room = await Room.create({
            name: repoName, // Use repo name as room name
            leader_id: userId,
            invite_id: inviteId
        });

        // Add user as room member
        const room_member = await RoomMember.create({
            room_id: room.id,
            user_id: userId,
            role: 'leader',
        });

        res.status(201).json({
            message: "Room created and repository cloned successfully",
            room: {
                id: room.id,
                name: room.name,
                invite_id: room.invite_id
            }
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to create room", details: error.message });
    }
};

export const joinRoom = async (req, res) => {
    const { inviteCode } = req.body;
    
    // Get user ID from the authenticated request
    const userId = req.user.userId;

    try {
        // Check if user exists
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Look up the room by invite code
        const room = await Room.findOne({
            where: { invite_id: inviteCode }
        });

        if (!room) {
            return res.status(404).json({ message: "Invalid invite code" });
        }

        const existingMember = await RoomMember.findOne({
            where: {
                room_id: room.id,
                user_id: userId
            }
        });

        if (existingMember) {
            return res.status(400).json({ message: "You are already a member of this room" });
        }

        const newMember = await RoomMember.create({
            room_id: room.id,
            user_id: userId,
            role: 'member'
        });

        res.status(200).json({
            message: "Successfully joined the room",
            room: {
                id: room.id,
                name: room.name,
                invite_id: room.invite_id
            }
        });
    } catch (error) {
        res.status(500).json({
            error: "Failed to join the room",
            details: error.message
        });
    }
};

export const getUserRooms = async (req, res) => {
    // Get user ID from the authenticated request
    const userId = req.user.userId;

    try {
        // Find all room memberships for the user
        const roomMembers = await RoomMember.findAll({
            where: {
                user_id: userId
            },
            include: [{
                model: Room,
                attributes: ['id', 'name', 'leader_id', 'invite_id']
            }]
        });

        // Extract rooms from room memberships
        const rooms = await Promise.all(roomMembers.map(async member => {
            const room = member.Room;
            
            // Get all members for this room
            const allMembers = await RoomMember.findAll({
                where: {
                    room_id: room.id
                },
                include: [{
                    model: User,
                    attributes: ['id', 'name', 'github_username']
                }]
            });
            
            // Format members data
            const members = allMembers.map(m => ({
                id: m.User.id,
                name: m.User.name,
                github_username: m.User.github_username,
                role: m.role
            }));
            
            // Get leader information
            let leader = null;
            if (room.leader_id) {
                leader = await User.findByPk(room.leader_id, {
                    attributes: ['id', 'name', 'github_username']
                });
            }
            
            return {
                ...room.get({ plain: true }),
                leader: leader ? leader.get({ plain: true }) : null,
                members: members,
                owner_id: room.leader_id
            };
        }));

        res.status(200).json({
            rooms
        });
    } catch (error) {
        res.status(500).json({
            error: "Failed to fetch user rooms",
            details: error.message
        });
    }
};

export const getRoomById = async (req, res) => {
    const roomId = req.params.roomId;
    const userId = req.user.userId;

    try {
        // Find the room
        const room = await Room.findByPk(roomId);

        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        // Check if user is a member of the room
        const roomMember = await RoomMember.findOne({
            where: {
                room_id: roomId,
                user_id: userId
            }
        });

        if (!roomMember) {
            return res.status(403).json({ message: "You don't have access to this room" });
        }

        // Get all members of the room
        const members = await RoomMember.findAll({
            where: {
                room_id: roomId
            },
            include: [{
                model: User,
                attributes: ['id', 'name', 'github_username', 'email']
            }]
        });

        // Format members data
        const formattedMembers = members.map(member => ({
            id: member.User.id,
            name: member.User.name,
            github_username: member.User.github_username,
            email: member.User.email,
            role: member.role
        }));

        res.status(200).json({
            room,
            members: formattedMembers
        });
    } catch (error) {
        res.status(500).json({
            error: "Failed to fetch room details",
            details: error.message
        });
    }
};

export const deleteRoom = async (req, res) => {
    const roomId = req.params.roomId;
    const userId = req.user.userId;

    try {
        // Find the room
        const room = await Room.findByPk(roomId);

        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        // Check if user is the leader of the room
        if (room.leader_id !== userId) {
            return res.status(403).json({ message: "You don't have permission to delete this room" });
        }

        // Delete room members
        await RoomMember.destroy({
            where: {
                room_id: roomId
            }
        });

        // Delete the room
        await room.destroy();

        // Delete any related repository files if they exist
        const repoDir = path.resolve(__dirname, "../cloned_repos", `${userId}_${room.name}`);
        
        if (fs.existsSync(repoDir)) {
            fs.rmSync(repoDir, { recursive: true, force: true });
        }

        res.status(200).json({
            message: "Room deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            error: "Failed to delete room",
            details: error.message
        });
    }
};
