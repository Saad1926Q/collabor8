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