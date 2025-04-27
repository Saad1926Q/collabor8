import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import auth from './routes/auth.js';
import gitRoutes from './routes/gitRoutes.js';

dotenv.config();

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); 
app.use(express.json()); 

// Define routes
app.use('/api/git', gitRoutes);
app.use('/api/auth', auth);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
