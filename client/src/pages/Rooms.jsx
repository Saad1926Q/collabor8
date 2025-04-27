import { useState } from "react";
import React from "react";
import Navbar from "../components/Navbar";
import axios from "axios";  

const Rooms = () => {
    const [roomName, setRoomName] = useState("");
    const [inviteCode, setInviteCode] = useState("");  
    const [repoUrl, setRepoUrl] = useState("");
    const [error, setError] = useState("");

    const rooms = [
    {
      name: "Frontend Team",
      members: ["You","Alice", "Bob", "Charlie"],
      codebase: {
        name: "frontend-ui",
        lastUpdated: "2 days ago",
      },
    },
    {
      name: "Backend Squad",
      members: ["You","Dave", "Eve", "Frank"],
      codebase: {
        name: "api-service",
        lastUpdated: "5 hours ago",
      },
    },
    {
      name: "DevOps Crew",
      members: ["You","Grace", "Heidi"],
      codebase: {
        name: "infra-scripts",
        lastUpdated: "1 day ago",
      },
    },
  ];

  const handleCreateRoom = async () => {
    try {
      const response = await axios.post("/api/rooms/create", {
        room_name: roomName,
        repo_url: repoUrl,
      });

      if (response.status === 200) {
        console.log("Room created successfully", response.data);
        setRoomName("");
        setRepoUrl("");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create room");
      console.error("Error creating room:", error);
    }
  };


  const handleJoinRoom = () => {
    console.log("Join room with code:", inviteCode);
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <Navbar />

      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Available Rooms</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {rooms.map((room, index) => (
            <div key={index} className="bg-gray-800 p-4 rounded-lg shadow-md">
              <h2 className="text-lg font-bold mb-2">{room.name}</h2>

              <p className="text-gray-400 mb-1">Members:</p>
              <ul className="list-disc list-inside text-sm text-gray-300 mb-4">
                {room.members.map((member, i) => (
                  <li key={i}>{member}</li>
                ))}
              </ul>

              <div className="border-t border-gray-700 pt-3 mt-3">
                <p className="text-gray-400 text-sm">Codebase:</p>
                <p className="text-blue-400 font-semibold">{room.codebase.name}</p>
                <p className="text-gray-500 text-xs">Last updated: {room.codebase.lastUpdated}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-10">
          <h2 className="text-xl font-semibold mb-4">Create or Join a Room</h2>

          <div>
      <div className="mb-6">
        {/* Room Name Field */}
        <label className="block mb-2 text-sm">Room Name</label>
        <input
          type="text"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g. Mobile Team"
        />
      </div>

      <div className="mb-6">
        <label className="block mb-2 text-sm">Repository URL</label>
        <input
          type="url"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g. https://github.com/username/repository"
        />
      </div>

      <button
        onClick={handleCreateRoom}
        className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
      >
        Create Room
      </button>
    </div>

          <div className="mt-10">
            <label className="block mb-2 text-sm">Invite Code</label>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g. A7k2PzQ1"
            />
            <button
              onClick={handleJoinRoom}
              className="mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
            >
              Join Room
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rooms;
