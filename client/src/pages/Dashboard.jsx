import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const Dashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [projects, setProjects] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    ownedProjects: 0,
    joinedProjects: 0,
    totalCollaborators: 0
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    navigate("/");
  };

  const fetchUserProjects = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get("http://localhost:5001/api/rooms/user-rooms", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data && response.data.rooms) {
        const allProjects = response.data.rooms;
        setProjects(allProjects);
        
        // Calculate stats
        const ownedProjects = allProjects.filter(p => p.owner_id === userData?.id);
        const joinedProjects = allProjects.filter(p => p.owner_id !== userData?.id);
        
        // Count total unique collaborators
        const uniqueCollaborators = new Set();
        allProjects.forEach(project => {
          if (project.members) {
            project.members.forEach(member => {
              if (member.id !== userData?.id) {
                uniqueCollaborators.add(member.id);
              }
            });
          }
        });
        
        setStats({
          totalProjects: allProjects.length,
          ownedProjects: ownedProjects.length,
          joinedProjects: joinedProjects.length,
          totalCollaborators: uniqueCollaborators.size
        });
        
        // Sort projects by last updated and take the 3 most recent
        const sorted = [...allProjects].sort((a, b) => 
          new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
        );
        setRecentProjects(sorted.slice(0, 3));
        
        // Generate mock activity data based on real projects
        const mockActivities = [];
        sorted.slice(0, 5).forEach((project, index) => {
          const timeAgo = index === 0 ? "Just now" : 
                         index === 1 ? "1 hour ago" : 
                         `${index + 1} hours ago`;
          
          const actions = [
            `Updated code in ${project.name}`,
            `Joined ${project.name}`,
            `Created ${project.name}`,
            `Committed changes to ${project.name}`,
            `Reviewed code in ${project.name}`
          ];
          
          mockActivities.push({
            text: actions[index % actions.length],
            time: timeAgo,
            project: project.name
          });
        });
        
        setActivityData(mockActivities);
      }
    } catch (err) {
      console.error("Error fetching user projects:", err);
      
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        navigate("/");
        return;
      }
      
      setError("Failed to load projects");
    }
  };

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
        setLoading(false);
      } catch (err) {
        console.error("Error fetching user data:", err);
        
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          navigate("/");
          return;
        }
        
        setError("Failed to load user data");
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  useEffect(() => {
    if (userData) {
      fetchUserProjects();
    }
  }, [userData]);

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <aside className="w-1/5 bg-gray-800 p-4 border-r border-gray-700">
        <a href="/" className="text-xl font-bold mb-8 block">Collabor8</a>
        <nav>
          <ul>
            <li className="py-2 px-4 rounded bg-blue-600">Dashboard</li>
            <li className="py-2 px-4 rounded hover:bg-gray-700 cursor-pointer" onClick={() => navigate("/rooms")}>Rooms</li>
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
        {/* Welcome Section */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            {loading ? "Loading..." : error ? "Error loading data" : `Welcome back, ${userData?.name || "Developer"}!`}
          </h1>
          <div className="flex space-x-2">
            <button 
              onClick={() => navigate("/rooms")}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Manage Rooms
            </button>
            <button 
              onClick={() => navigate("/rooms#createRoomForm")}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Clone Repo
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800 p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-bold">Total Projects</h3>
            <p className="text-2xl font-bold text-blue-500">{stats.totalProjects}</p>
            <p className="text-gray-400 text-sm">Active collaborations</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-bold">Your Rooms</h3>
            <p className="text-2xl font-bold text-green-500">{stats.ownedProjects}</p>
            <p className="text-gray-400 text-sm">Rooms you created</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-bold">Joined Rooms</h3>
            <p className="text-2xl font-bold text-yellow-500">{stats.joinedProjects}</p>
            <p className="text-gray-400 text-sm">Rooms you&apos;re part of</p>
          </div>
        </div>

        {/* Recent Projects Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Recent Projects</h2>
            <Link to="/rooms" className="text-blue-400 hover:text-blue-300">View all →</Link>
          </div>

          {loading ? (
            <div className="bg-gray-800 p-6 rounded-lg flex justify-center">
              <p>Loading projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="bg-gray-800 p-6 rounded-lg text-center">
              <p className="text-gray-400 mb-4">You don&apos;t have any projects yet.</p>
              <button 
                onClick={() => navigate("/rooms")} 
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Create Your First Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentProjects.map((project) => (
                <div key={project.id} className="bg-gray-800 p-4 rounded-lg shadow-md">
                  <h3 className="text-lg font-bold text-blue-400 mb-2">{project.name}</h3>
                  <div className="flex items-center mb-2">
                    {project.owner_id === userData?.id ? (
                      <>
                        <span className="text-xs bg-blue-500 bg-opacity-20 text-blue-400 px-2 py-1 rounded mr-2">
                          Owner
                        </span>
                        {project.members && project.members.length > 1 && (
                          <span className="text-xs bg-purple-500 bg-opacity-20 text-white px-2 py-1 rounded">
                            {project.members.length - 1} Member{project.members.length - 1 !== 1 ? 's' : ''}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-xs bg-green-500 bg-opacity-20 text-white px-2 py-1 rounded">
                        Member
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mb-3 truncate">{project.repo_url}</p>
                  <div className="mt-4">
                    <Link 
                      to={`/code/${project.id}`} 
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 w-full block text-center"
                    >
                      Open Project
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity and User Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="md:col-span-2">
            <div className="bg-gray-800 p-4 rounded-lg shadow-md h-full">
              <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
              {loading ? (
                <p>Loading activities...</p>
              ) : activityData.length === 0 ? (
                <p className="text-gray-400">No recent activity</p>
              ) : (
                <ul>
                  {activityData.map((activity, index) => (
                    <li key={index} className="py-2 border-b border-gray-700 last:border-none">
                      <div className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2"></div>
                        <div>
                          <p>{activity.text}</p>
                          <p className="text-gray-400 text-sm">{activity.time}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* User Profile Card */}
          <div className="md:col-span-1">
            <div className="bg-gray-800 p-4 rounded-lg shadow-md h-full">
              <div className="flex flex-col items-center mb-4">
                <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center text-3xl mb-2">
                  {userData?.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <h3 className="text-lg font-bold">{userData?.name}</h3>
                <p className="text-gray-400">{userData?.github_username}</p>
              </div>
              
              <div className="border-t border-gray-700 pt-4">
                <div className="mb-2">
                  <p className="text-gray-400 text-sm">Email:</p>
                  <p className="text-sm">{userData?.email}</p>
                </div>
                <div className="mb-4">
                  <p className="text-gray-400 text-sm">Account ID:</p>
                  <p className="text-sm">{userData?.id}</p>
                </div>
                <button 
                  onClick={() => navigate("/settings")}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded text-sm hover:bg-gray-600"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
