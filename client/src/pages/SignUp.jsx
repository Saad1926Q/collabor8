import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const SignUp = () => {
  const [name, setName] = useState("");
  const [github_username, setGithubUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await axios.post("http://localhost:5001/api/auth/register", 
        { name, github_username, email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("refreshToken", response.data.refreshToken);
      
      // Add a small delay to ensure tokens are properly stored
      setTimeout(() => {
        navigate("/dashboard");
      }, 100);
    } catch (error) {
      console.error("Signup failed:", error);
      setError(error.response?.data?.message || error.response?.data?.error || "Registration failed");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#0D1117]">
      <form onSubmit={handleSubmit} className="bg-[#161B22] p-8 rounded-2xl shadow-lg w-[400px]">
        <h2 className="text-center text-blue-400 text-2xl font-bold">Collabor8</h2>
        <h1 className="text-white text-2xl font-semibold text-center mt-4">Create Account</h1>
        
        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 text-orange-100 px-4 py-2 rounded-lg mb-4 mt-4">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="text-gray-300 block mb-1">Name</label>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 bg-[#21262D] text-white rounded-lg border border-gray-600 focus:border-blue-500"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="githubUsername" className="text-gray-300 block mb-1">
            Github Username
          </label>
          <input
            type="text"
            id="githubUsername"
            placeholder="Enter your Github username"
            value={github_username}
            onChange={(e) => setGithubUsername(e.target.value)}
            className="w-full px-4 py-2 bg-[#21262D] text-white rounded-lg border border-gray-600 focus:border-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="text-gray-300 block mb-1">Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 bg-[#21262D] text-white rounded-lg border border-gray-600 focus:border-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="text-gray-300 block mb-1">Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 bg-[#21262D] text-white rounded-lg border border-gray-600 focus:border-blue-500"
          />
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-green-500 text-white py-2 rounded-lg font-semibold hover:bg-green-600 transition disabled:opacity-50"
        >
          {isLoading ? "Creating Account..." : "Sign Up"}
        </button>

        <p className="text-gray-400 text-center mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-400 cursor-pointer hover:underline">
            Sign In
          </Link>
        </p>
      </form>
    </div>
  );
};

export default SignUp;
