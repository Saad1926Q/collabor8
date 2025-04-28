import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../models/index.js';

import dotenv from 'dotenv';
dotenv.config();

const User = db.User;

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = '1h' ;
const JWT_REFRESH_SECRET= process.env.JWT_REFRESH_SECRET;
const JWT_REFRSH_EXPIRY = '7d';

// REGISTER CONTROLLER 

export const register = async(req,res)=>{
    const {name,github_username,email,password} = req.body;

    try{
        const existingUser = await User.findOne({where :{email}});
        if(existingUser)
        {
            return res.status(400).json({message:"User already exists with this email"})
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password,saltRounds);

        //CREATE USER 


        const user = await User.create({
            name,
            github_username,
            email,
            password: hashedPassword,
        })

        

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
        const refreshToken = jwt.sign({ userId: user.id }, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRSH_EXPIRY });

        user.refreshToken = refreshToken;
        await user.save();
    
        res.status(201).json({
          message: "User registered successfully",
          token,
          refreshToken,
        });
    }catch (err) {
        res.status(500).json({ error: "Registration failed", details: err.message });
      }
}

// LOGIN CONTROLLER
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ where: { email } });
    
    // If user doesn't exist
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate tokens
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
    const refreshToken = jwt.sign({ userId: user.id }, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRSH_EXPIRY });

    // Update refresh token in database
    user.refreshToken = refreshToken;
    await user.save();

    // Send response
    res.status(200).json({
      message: "Login successful",
      token,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        github_username: user.github_username
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed", details: error.message });
  }
};

// FORGOT PASSWORD CONTROLLER
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ where: { email } });
    
    // If user doesn't exist, still return success to prevent email enumeration
    if (!user) {
      return res.status(200).json({ message: "If your email exists in our system, you will receive a password reset link" });
    }

    // In a real application, you would:
    // 1. Generate a password reset token
    // 2. Save it to the database with an expiration
    // 3. Send an email with a reset link

    // For this demo, we'll just return a success message
    res.status(200).json({ message: "If your email exists in our system, you will receive a password reset link" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Request failed", details: error.message });
  }
};

// GET USER PROFILE
export const getUserProfile = async (req, res) => {
  try {
    // req.user contains the payload from the JWT token
    const userId = req.user.userId;
    
    // Find the user by ID
    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'github_username', 'refreshToken']
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Return the user data
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile', details: error.message });
  }
};

// DELETE USER ACCOUNT
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { password } = req.body;
    
    // Find the user by ID
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Verify password before deletion
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid password" });
    }
    
    // Delete the user
    await user.destroy();
    
    // Return success message
    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ error: 'Failed to delete account', details: error.message });
  }
};
