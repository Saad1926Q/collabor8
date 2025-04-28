import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await axios.post("http://localhost:5001/api/auth/login", 
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      // Store tokens in localStorage
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("refreshToken", response.data.refreshToken);
      
      // Redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.error || "An error occurred during login");
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    if (!email) {
      setError("Please enter your email address");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post("http://localhost:5001/api/auth/forgot-password", 
        { email },
        { headers: { "Content-Type": "application/json" } }
      );

      setSuccessMessage(response.data.message);
      setIsLoading(false);
    } catch (err) {
      console.error("Forgot password error:", err);
      setError(err.response?.data?.error || "An error occurred while processing your request");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#0D1117]">
      <div className="bg-[#161B22] p-8 rounded-2xl shadow-lg w-[400px]">
        {/* Logo */}
        <h2 className="text-center text-blue-400 text-2xl font-bold">LOGO</h2>

        {/* Heading */}
        <h1 className="text-white text-2xl font-semibold text-center mt-4">CodeCollab</h1>
        <p className="text-gray-400 text-center mb-6">Collaborative Code Editor</p>

        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-500 px-4 py-2 rounded-lg mb-4">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-500 bg-opacity-20 border border-green-500 text-green-500 px-4 py-2 rounded-lg mb-4">
            {successMessage}
          </div>
        )}

        {forgotPasswordMode ? (
          <form onSubmit={handleForgotPassword}>
            {/* Email Input */}
            <div className="mb-4">
              <label className="text-gray-300 block mb-1">Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-[#21262D] text-white rounded-lg outline-none border border-gray-600 focus:border-blue-500"
                required
              />
            </div>

            {/* Reset Password Button */}
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition disabled:opacity-50"
            >
              {isLoading ? "Processing..." : "Reset Password"}
            </button>

            {/* Back to Login */}
            <p className="text-sm text-blue-400 text-center mt-2 cursor-pointer hover:underline" onClick={() => setForgotPasswordMode(false)}>
              Back to login
            </p>
          </form>
        ) : (
          <form onSubmit={handleLogin}>
            {/* Email Input */}
            <div className="mb-4">
              <label className="text-gray-300 block mb-1">Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-[#21262D] text-white rounded-lg outline-none border border-gray-600 focus:border-blue-500"
                required
              />
            </div>

            {/* Password Input */}
            <div className="mb-4">
              <label className="text-gray-300 block mb-1">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-[#21262D] text-white rounded-lg outline-none border border-gray-600 focus:border-blue-500"
                required
              />
            </div>

            {/* Sign In Button */}
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition disabled:opacity-50"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </button>

            {/* Forgot Password */}
            <p className="text-sm text-blue-400 text-center mt-2 cursor-pointer hover:underline" onClick={() => setForgotPasswordMode(true)}>
              Forgot password?
            </p>
          </form>
        )}

        {/* Sign Up Link */}
        <p className="text-gray-400 text-center mt-4">
          Don't have an account?{" "}
          <Link to="/signup" className="text-blue-400 cursor-pointer hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
