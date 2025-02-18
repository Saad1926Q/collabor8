import React from "react";
import { Link } from "react-router-dom";

const Login = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-[#0D1117]">
      <div className="bg-[#161B22] p-8 rounded-2xl shadow-lg w-[400px]">
        {/* Logo */}
        <h2 className="text-center text-blue-400 text-2xl font-bold">LOGO</h2>

        {/* Heading */}
        <h1 className="text-white text-2xl font-semibold text-center mt-4">CodeCollab</h1>
        <p className="text-gray-400 text-center mb-6">Collaborative Code Editor</p>

        {/* Email Input */}
        <div className="mb-4">
          <label className="text-gray-300 block mb-1">Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full px-4 py-2 bg-[#21262D] text-white rounded-lg outline-none border border-gray-600 focus:border-blue-500"
          />
        </div>

        {/* Password Input */}
        <div className="mb-4">
          <label className="text-gray-300 block mb-1">Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            className="w-full px-4 py-2 bg-[#21262D] text-white rounded-lg outline-none border border-gray-600 focus:border-blue-500"
          />
        </div>

        {/* Sign In Button */}
        <button className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition">
          Sign In
        </button>

        {/* Forgot Password */}
        <p className="text-sm text-blue-400 text-center mt-2 cursor-pointer hover:underline">
          Forgot password?
        </p>

        {/* OR Divider */}
        <div className="flex items-center my-4">
          <hr className="flex-grow border-gray-600" />
          <span className="text-gray-400 px-2">Or continue with</span>
          <hr className="flex-grow border-gray-600" />
        </div>

        {/* Social Login Buttons */}
        <div className="flex gap-3">
          <button className="w-full flex items-center justify-center gap-2 bg-gray-700 text-white py-2 rounded-lg hover:bg-gray-600">
            <span>🔗</span> GitHub
          </button>
          <button className="w-full flex items-center justify-center gap-2 bg-gray-700 text-white py-2 rounded-lg hover:bg-gray-600">
            <span>🔗</span> Google
          </button>
        </div>

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
