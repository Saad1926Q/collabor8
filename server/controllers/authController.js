import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../models/index.js';


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

        const user = await User.create({})
    }
}