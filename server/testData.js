import db from './models/index.js';

async function logDummyData() {
  try {
    const users = await db.User.findAll();
    console.log('Users:', JSON.stringify(users, null, 2));

    const rooms = await db.Room.findAll();
    console.log('Rooms:', JSON.stringify(rooms, null, 2));

    const roomMembers = await db.RoomMember.findAll();
    console.log('Room Members:', JSON.stringify(roomMembers, null, 2));



  } catch (err) {
    console.error('Error fetching data:', err);
  }
}

logDummyData();
