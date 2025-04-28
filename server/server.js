import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import auth from './routes/auth.js';
import gitRoutes from './routes/gitRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import db from './models/index.js';

dotenv.config();

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Define routes
app.use('/api/git', gitRoutes);
app.use('/api/auth', auth);
app.use('/api/rooms', roomRoutes);

// Socket.io connection handling
const User = db.User;
const Room = db.Room;
const ChatMessage = db.ChatMessage;

// Store active users and their cursors
const activeUsers = {};
const roomUsers = {};

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  // Join a room
  socket.on('join-room', async ({ roomId, userId, username, color }) => {
    socket.join(roomId);
    
    // Store user information
    if (!roomUsers[roomId]) {
      roomUsers[roomId] = {};
    }
    
    roomUsers[roomId][socket.id] = {
      userId,
      username,
      color,
      cursor: { line: 0, column: 0 }
    };
    
    // Notify others that a new user joined
    socket.to(roomId).emit('user-joined', {
      socketId: socket.id,
      userId,
      username,
      color
    });
    
    // Send current users to the new user
    socket.emit('current-users', Object.entries(roomUsers[roomId]).map(([socketId, user]) => ({
      socketId,
      userId: user.userId,
      username: user.username,
      color: user.color,
      cursor: user.cursor
    })));
    
    // Load previous chat messages
    try {
      const messages = await ChatMessage.findAll({
        where: { room_id: roomId },
        include: [{
          model: User,
          attributes: ['id', 'name', 'github_username']
        }],
        order: [['timestamp', 'ASC']],
        limit: 50
      });
      
      const formattedMessages = messages.map(msg => ({
        id: msg.id,
        text: msg.message,
        user: msg.User.name,
        timestamp: msg.timestamp
      }));
      
      socket.emit('chat-history', formattedMessages);
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  });
  
  // Handle cursor position updates
  socket.on('cursor-move', ({ roomId, line, column }) => {
    if (roomUsers[roomId] && roomUsers[roomId][socket.id]) {
      roomUsers[roomId][socket.id].cursor = { line, column };
      
      // Broadcast cursor position to other users in the room
      socket.to(roomId).emit('cursor-update', {
        socketId: socket.id,
        userId: roomUsers[roomId][socket.id].userId,
        username: roomUsers[roomId][socket.id].username,
        color: roomUsers[roomId][socket.id].color,
        cursor: { line, column }
      });
      
      // Also send a heartbeat to indicate this user is active
      io.to(roomId).emit('user-active', {
        userId: roomUsers[roomId][socket.id].userId,
        timestamp: Date.now()
      });
    }
  });
  
  // Handle text selection updates
  socket.on('selection-change', ({ roomId, selection }) => {
    if (roomUsers[roomId] && roomUsers[roomId][socket.id]) {
      roomUsers[roomId][socket.id].selection = selection;
      
      // Broadcast selection to other users in the room
      socket.to(roomId).emit('selection-update', {
        socketId: socket.id,
        userId: roomUsers[roomId][socket.id].userId,
        username: roomUsers[roomId][socket.id].username,
        color: roomUsers[roomId][socket.id].color,
        selection
      });
    }
  });
  
  // Handle code changes
  socket.on('code-change', ({ roomId, changes, filename }) => {
    if (!roomUsers[roomId] || !roomUsers[roomId][socket.id]) return;
    
    // Store the user's color if not already set
    if (!roomUsers[roomId][socket.id].color) {
      roomUsers[roomId][socket.id].color = getRandomColor();
    }
    
    // Broadcast code changes to other users in the room
    socket.to(roomId).emit('code-update', {
      socketId: socket.id,
      userId: roomUsers[roomId][socket.id].userId,
      username: roomUsers[roomId][socket.id].username,
      color: roomUsers[roomId][socket.id].color,
      changes,
      filename
    });
    
    // Also send a heartbeat to indicate this user is active
    io.to(roomId).emit('user-active', {
      userId: roomUsers[roomId][socket.id].userId,
      timestamp: Date.now()
    });
  });
  
  // Helper function to generate a random color
  function getRandomColor() {
    const colors = [
      "#FF5733", // Red
      "#33FF57", // Green
      "#3357FF", // Blue
      "#FF33A8", // Pink
      "#33FFF5", // Cyan
      "#F5FF33", // Yellow
      "#FF8333", // Orange
      "#8333FF", // Purple
      "#33FF8B", // Mint
      "#FF33F5"  // Magenta
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
  
  // Handle chat messages
  socket.on('send-message', async ({ roomId, message }) => {
    if (!roomUsers[roomId] || !roomUsers[roomId][socket.id]) return;
    
    const userId = roomUsers[roomId][socket.id].userId;
    const username = roomUsers[roomId][socket.id].username;
    
    try {
      // Save message to database
      const chatMessage = await ChatMessage.create({
        room_id: roomId,
        user_id: userId,
        message
      });
      
      // Broadcast message to all users in the room
      io.to(roomId).emit('receive-message', {
        id: chatMessage.id,
        text: message,
        user: username,
        timestamp: chatMessage.timestamp
      });
    } catch (error) {
      console.error('Error saving chat message:', error);
    }
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Remove user from all rooms they were in
    Object.keys(roomUsers).forEach(roomId => {
      if (roomUsers[roomId] && roomUsers[roomId][socket.id]) {
        // Notify others that user left
        socket.to(roomId).emit('user-left', {
          socketId: socket.id,
          userId: roomUsers[roomId][socket.id].userId,
          username: roomUsers[roomId][socket.id].username
        });
        
        // Remove user from room
        delete roomUsers[roomId][socket.id];
        
        // Clean up empty rooms
        if (Object.keys(roomUsers[roomId]).length === 0) {
          delete roomUsers[roomId];
        }
      }
    });
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
