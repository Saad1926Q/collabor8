import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Settings = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    github_username: "",
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [password, setPassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const [notifications, setNotifications] = useState(true);
  // const [darkMode, setDarkMode] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");

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
        setFormData({
          name: response.data.name || "",
          email: response.data.email || "",
          github_username: response.data.github_username || "",
        });
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage("");
    
    try {
      const token = localStorage.getItem("token");
      
      // This endpoint doesn't exist yet, but would be implemented in a real app
      await axios.put("http://localhost:5001/api/auth/update-profile", formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsSubmitting(true);
    setDeleteError("");
    
    try {
      const token = localStorage.getItem("token");
      
      await axios.delete("http://localhost:5001/api/auth/delete-account", {
        headers: {
          Authorization: `Bearer ${token}`
        },
        data: { password }
      });
      
      // Clear tokens and redirect to home page
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      navigate("/");
    } catch (error) {
      console.error("Error deleting account:", error);
      setDeleteError(error.response?.data?.error || "Failed to delete account");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    navigate("/");
  };

  return (
    <main className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <aside className="w-1/5 bg-gray-800 p-4 border-r border-gray-700">
        <a href="/" className="text-xl font-bold mb-8 block">Collabor8</a>
        <nav>
          <ul>
            <li className="py-2 px-4 rounded hover:bg-gray-700 cursor-pointer" onClick={() => navigate("/dashboard")}>Dashboard</li>
            <li className="py-2 px-4 rounded hover:bg-gray-700 cursor-pointer" onClick={() => navigate("/rooms")}>Rooms</li>
            <li className="py-2 px-4 rounded bg-blue-600">Settings</li>
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
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">User Settings</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-xl">Loading...</p>
          </div>
        ) : error ? (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-500 px-4 py-2 rounded-lg mb-4">
            {error}
          </div>
        ) : (
          <>
            {successMessage && (
              <div className="bg-green-500 bg-opacity-20 border border-green-500 text-green-500 px-4 py-2 rounded-lg mb-4">
                {successMessage}
              </div>
            )}
            
            <div className="flex flex-col md:flex-row gap-6 mb-6">
              {/* Profile Section */}
              <div className="w-full md:w-1/3 bg-gray-800 p-6 rounded-lg shadow-md flex flex-col items-center">
                <div className="w-24 h-24 bg-gray-600 rounded-full mb-4 flex items-center justify-center text-3xl">
                  {userData?.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <h2 className="text-xl font-bold">{userData?.name}</h2>
                <p className="text-gray-400">{userData?.github_username}</p>
                <p className="text-gray-400 mt-2">{userData?.email}</p>
              </div>
              
              {/* User Details Form */}
              <div className="w-full md:w-2/3 bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-bold mb-4">Profile Information</h3>
                <form onSubmit={handleSaveChanges}>
                  <div className="mb-4">
                    <label className="block text-gray-400 mb-1">Name</label>
                    <input 
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="p-2 bg-gray-700 rounded w-full" 
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-400 mb-1">Email Address</label>
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="p-2 bg-gray-700 rounded w-full" 
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-400 mb-1">GitHub Username</label>
                    <input 
                      type="text" 
                      name="github_username"
                      value={formData.github_username}
                      onChange={handleInputChange}
                      className="p-2 bg-gray-700 rounded w-full" 
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </button>
                </form>
              </div>
            </div> 
            {/* Danger Zone */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-red-500">
              <h3 className="text-lg font-bold mb-4 text-red-500">Danger Zone</h3>
              <p className="text-gray-400 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
              <button 
                onClick={() => setShowDeleteModal(true)}
                className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
              >
                Delete Account
              </button>
            </div>
          </>
        )}
        
        {/* Delete Account Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-red-500">Delete Account</h2>
                <button 
                  onClick={() => {
                    setShowDeleteModal(false);
                    setPassword("");
                    setDeleteError("");
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              <p className="text-gray-300 mb-4">
                This action cannot be undone. This will permanently delete your account and remove all your data.
              </p>
              
              {deleteError && (
                <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-500 px-4 py-2 rounded-lg mb-4">
                  {deleteError}
                </div>
              )}
              
              <div className="mb-4">
                <label className="block text-gray-400 mb-1">Please enter your password to confirm:</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-red-500"
                  placeholder="Your password"
                  required
                />
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setPassword("");
                    setDeleteError("");
                  }}
                  className="bg-gray-700 text-white px-4 py-2 rounded mr-2 hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={!password || isSubmitting}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                >
                  {isSubmitting ? "Deleting..." : "Delete Account"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </main>
  );
};

export default Settings;
