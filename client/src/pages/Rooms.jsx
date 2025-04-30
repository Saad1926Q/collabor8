import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const Rooms = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [roomName, setRoomName] = useState("");
  const [inviteCode, setInviteCode] = useState("");  
  const [repoUrl, setRepoUrl] = useState("");
  const [modalError, setModalError] = useState("");
  const [modalSuccess, setModalSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // all, owned, joined

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      
      if (!token) {
        navigate("/");
        return;
      }

      try {
        const response = await axios.get("http://localhost:5001/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setUserData(response.data);
      } catch (err) {
        console.error("Error fetching user data:", err);
        
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          navigate("/");
          return;
        }
      }
    };

    fetchUserData();
    fetchRooms();
  }, [navigate]);

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      setLoading(true);
      const response = await axios.get("http://localhost:5001/api/rooms/user-rooms", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data && response.data.rooms) {
        setRooms(response.data.rooms);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching rooms:", err);
      setError("Failed to load rooms");
      setLoading(false);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setModalError("");
    setModalSuccess("");
    setIsLoading(true);

    if (!repoUrl) {
      setModalError("Repository URL is required");
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      
      const response = await axios.post("http://localhost:5001/api/rooms/create", {
        repo_url: repoUrl,
        name: roomName || extractRepoName(repoUrl)
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 201) {
        setModalSuccess("Repository cloned and room created successfully!");
        setRepoUrl("");
        setRoomName("");
        fetchRooms();
      }
    } catch (error) {
      setModalError(error.response?.data?.message || "Failed to create room");
      console.error("Error creating room:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    setModalError("");
    setModalSuccess("");
    setIsLoading(true);

    if (!inviteCode) {
      setModalError("Invite Code is required");
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      
      const response = await axios.post("http://localhost:5001/api/rooms/join", {
        inviteCode: inviteCode
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        setModalSuccess("Successfully joined the room!");
        setInviteCode("");
        fetchRooms();
      }
    } catch (error) {
      setModalError(error.response?.data?.message || "Failed to join room");
      console.error("Error joining room:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!confirm("Are you sure you want to delete this room?")) return;
    
    try {
      const token = localStorage.getItem("token");
      
      const response = await axios.delete(`http://localhost:5001/api/rooms/${roomId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        fetchRooms();
      }
    } catch (error) {
      console.error("Error deleting room:", error);
      setError("Failed to delete room");
    }
  };

  const extractRepoName = (url) => {
    if (!url) return "";
    
    // Extract repo name from URL
    const parts = url.split('/');
    return parts[parts.length - 1].replace('.git', '') || "New Project";
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    navigate("/");
  };

  const filteredRooms = rooms.filter(room => {
    // Filter by search term
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (room.repo_url && room.repo_url.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filter by tab
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "owned") return matchesSearch && room.owner_id === userData?.id;
    if (activeTab === "joined") return matchesSearch && room.owner_id !== userData?.id;
    
    return matchesSearch;
  });

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <aside className="w-1/5 bg-gray-800 p-4 border-r border-gray-700">
        <a href="/" className="text-xl font-bold mb-8 block">Collabor8</a>
        <nav>
          <ul>
            <li className="py-2 px-4 rounded hover:bg-gray-700 cursor-pointer" onClick={() => navigate("/dashboard")}>Dashboard</li>
            <li className="py-2 px-4 rounded bg-blue-600">Rooms</li>
            <li className="py-2 px-4 rounded hover:bg-gray-700 cursor-pointer" onClick={() => navigate("/settings")}>Settings</li>
            <li 
              className="py-2 px-4 mt-8 rounded bg-red-600 hover:bg-red-700 cursor-pointer text-center"
              onClick={handleLogout}
            >
              Logout
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Collaboration Rooms</h1>
          <div className="flex space-x-2">
            <button 
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded ${activeTab === "all" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}`}
            >
              All Rooms
            </button>
            <button 
              onClick={() => setActiveTab("owned")}
              className={`px-4 py-2 rounded ${activeTab === "owned" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}`}
            >
              My Rooms
            </button>
            <button 
              onClick={() => setActiveTab("joined")}
              className={`px-4 py-2 rounded ${activeTab === "joined" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}`}
            >
              Joined Rooms
            </button>
          </div>
        </div>

        {/* Search and Create/Join Buttons */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="w-full md:w-1/2">
            <input
              type="text"
              placeholder="Search rooms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex space-x-2 w-full md:w-auto">
            <button 
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex-1 md:flex-none"
              onClick={() => document.getElementById('createRoomForm').scrollIntoView({ behavior: 'smooth' })}
            >
              Create Room
            </button>
            <button 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex-1 md:flex-none"
              onClick={() => document.getElementById('joinRoomForm').scrollIntoView({ behavior: 'smooth' })}
            >
              Join Room
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 text-yellow-50 px-4 py-2 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Rooms Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-xl">Loading rooms...</p>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="bg-gray-800 p-6 rounded-lg text-center mb-10">
            <p className="text-gray-400 mb-4">No rooms found. Create a new room or join an existing one.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {filteredRooms.map((room) => (
              <div key={room.id} className="bg-gray-800 p-4 rounded-lg shadow-md">
                <div className="flex justify-between items-start">
                  <h2 className="text-lg font-bold text-blue-400">{room.name}</h2>
                  {room.owner_id === userData?.id ? (
                    <button 
                      onClick={() => handleDeleteRoom(room.id)}
                      className="text-red-500 hover:text-red-700"
                      title="Delete Room"
                    >
                      ✕
                    </button>
                  ) : <></>}
                </div>
                
                <p className="text-sm text-gray-400 mb-3 truncate">{room.repo_url}</p>
                
                <div className="flex items-center mb-3">
                  {room.owner_id === userData?.id ? (
                    <>
                      <span className="text-xs bg-blue-500 bg-opacity-20 text-blue-400 px-2 py-1 rounded mr-2">
                        Owner
                      </span>
                      {room.members && room.members.length > 1 && (
                        <span className="text-xs bg-purple-500 bg-opacity-20 text-white px-2 py-1 rounded">
                          {room.members.length - 1} Member{room.members.length - 1 !== 1 ? 's' : ''}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-xs bg-green-500 bg-opacity-20 text-white px-2 py-1 rounded">
                      Member
                    </span>
                  )}
                </div>
                
                <div className="border-t border-gray-700 pt-3 mt-3 flex justify-between items-center">
                  <Link 
                    to={`/code/${room.id}`} 
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                  >
                    Open Project
                  </Link>
                  <div 
                    className="text-gray-400 text-xs cursor-pointer"
                    onClick={() => {
                      navigator.clipboard.writeText(room.invite_id);
                      alert('Invite code copied to clipboard!');
                    }}
                    title="Click to copy"
                  >
                    <span className="bg-gray-700 px-2 py-1 rounded hover:bg-gray-600">
                      Invite: {room.invite_id}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Room Form */}
        <div id="createRoomForm" className="bg-gray-800 p-6 rounded-lg shadow-md mb-10">
          <h2 className="text-xl font-semibold mb-4">Create a New Room</h2>
          
          {modalError && (
            <div className="bg-red-500 bg-opacity-20 border border-red-500 text-amber-100 px-4 py-2 rounded-lg mb-4">
              {modalError}
            </div>
          )}
          
          {modalSuccess && (
            <div className="bg-green-500 bg-opacity-20 border border-green-500 text-emerald-100 px-4 py-2 rounded-lg mb-4">
              {modalSuccess}
            </div>
          )}
          
          <form onSubmit={handleCreateRoom}>
            <div className="mb-4">
              <label className="block mb-2 text-sm">Room Name (Optional)</label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Mobile Team (will use repo name if empty)"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2 text-sm">Repository URL (Required)</label>
              <input
                type="url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. https://github.com/username/repository"
                required
              />
              <p className="text-xs text-gray-400 mt-1">The repository will be cloned for collaboration</p>
            </div>

            <button
              type="submit"
              disabled={isLoading || !repoUrl}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded disabled:opacity-50"
            >
              {isLoading ? "Creating..." : "Create Room"}
            </button>
          </form>
        </div>

        {/* Join Room Form */}
        <div id="joinRoomForm" className="bg-gray-800 p-6 rounded-lg shadow-md mb-10">
          <h2 className="text-xl font-semibold mb-4">Join an Existing Room</h2>
          
          <form onSubmit={handleJoinRoom}>
            <div className="mb-4">
              <label className="block mb-2 text-sm">Invite Code</label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. A7k2PzQ1"
                required
              />
              <p className="text-xs text-gray-400 mt-1">Ask the room owner for the invite code</p>
            </div>
            
            <button
              type="submit"
              disabled={isLoading || !inviteCode}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50"
            >
              {isLoading ? "Joining..." : "Join Room"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Rooms;
