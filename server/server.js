import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';

import auth from './routes/auth.js';
import gitRoutes from './routes/gitRoutes.js';
import roomRoutes from './routes/roomRoutes.js';

dotenv.config();
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const app = express();
const server = createServer(app);


const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", 
  
  }
});
console.log("hi")

let socketConnected = new Set()

io.on("connection",onConnected);

    function onConnected(socket){
        console.log(socket.id)
        socketConnected.add(socket.id)
        socket.emit("Socket_mssg","CLIENT IS CONNECTED")
        
        io.emit('Total-clients',socketConnected.size)

        socket.on("disconnect",()=>{
            console.log("Client is disconnect ",socket.id)
            socketConnected.delete(socket.id)
            io.emit('Total clients',socketConnected.size)
        })

        socket.on("Client-Mssg",(data)=>{
            console.log(data)
            socket.broadcast.emit("chat-message",data)
        })

        socket.on("feedback",(msg)=>{
                
            socket.broadcast.emit("feedback_mssg",msg)
        })
    }

    

    



// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/git', gitRoutes);
app.use('/api/auth', auth);
app.use('/api/rooms', roomRoutes);


// Start server
const PORT = process.env.PORT || 5000 ;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
