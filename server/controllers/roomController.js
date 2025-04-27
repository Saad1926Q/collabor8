import db from '../models/index.js';
import dotenv from 'dotenv';
import { customAlphabet } from 'nanoid'


dotenv.config();

const Room=db.Room
const RoomMember=db.RoomMember

export const createRoom=async(req,res)=>{
    const {room_name,repo_url}=req.body;

    /*
    LOGIC TO GET USER DATA HERE


    */

    let user="ayan-gh"
    let leaderId=6

    const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 8)
    const inviteId=nanoid()

    try {
        const existingRoom = await Room.findOne({
            where: {
              name: room_name,
              leader_id: leaderId 
            }
          });

          if(existingRoom){
            return res.status(400).json({message:"Such a room already exists"})
          }

          const room = await Room.create({
            name:room_name,
            leader_id:leaderId,
            repo_url:repo_url,
            invite_id:inviteId
        })

        await room.save()

        const room_member=await RoomMember.create({
            room_id: room.id,
            user_id: leaderId,
            role: 'leader',
          });

          await room_member.save()

        res.status(201).json({
            message: "Room Created successfully",
          });
    } catch (error) {
        res.status(500).json({ error: "Failed to create room",details:error.message  });
    }

}

export const joinRoom=async(req,res)=>{
    const { inviteId } = req.body;

    let userId=7;

    try {
        const room = await Room.findOne({
            where: {
                invite_id: inviteId
            }
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

        if(existingMember){
            return res.status(400).json({ message: "You are already a member of this room" });
        }

        const newMember = await RoomMember.create({
            room_id: room.id,
            user_id: userId,
            role: 'member'  
        });

        await newMember.save()

        res.status(200).json({
            message: "Successfully joined the room",
            room: {
                id: room.id,
                name: room.name,
                repo_url: room.repo_url,
                invite_id: room.invite_id
            }
        });



    } catch (error) {
                res.status(500).json({
            error: "Failed to join the room",
            details: error.message
        });
    }
}