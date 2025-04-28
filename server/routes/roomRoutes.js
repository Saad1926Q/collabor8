import express from 'express';
import { createRoom, joinRoom, getUserRooms, getRoomById, deleteRoom } from '../controllers/roomController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Room management routes
router.post('/create', createRoom);
router.post('/join', joinRoom);
router.get('/user-rooms', getUserRooms);
router.get('/:roomId', getRoomById);
router.delete('/:roomId', deleteRoom);

export default router;
