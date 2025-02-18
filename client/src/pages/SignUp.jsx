import React from "react";
import { Link } from "react-router-dom";

const SignUp = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-[#0D1117]">
      <div className="bg-[#161B22] p-8 rounded-2xl shadow-lg w-[400px]">
        <h2 className="text-center text-blue-400 text-2xl font-bold">LOGO</h2>
        <h1 className="text-white text-2xl font-semibold text-center mt-4">Create Account</h1>

        <div className="mb-4">
          <label className="text-gray-300 block mb-1">Name</label>
          <input type="text" placeholder="Enter your name"
            className="w-full px-4 py-2 bg-[#21262D] text-white rounded-lg border border-gray-600 focus:border-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="text-gray-300 block mb-1">Email</label>
          <input type="email" placeholder="Enter your email"
            className="w-full px-4 py-2 bg-[#21262D] text-white rounded-lg border border-gray-600 focus:border-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="text-gray-300 block mb-1">Password</label>
          <input type="password" placeholder="Enter your password"
            className="w-full px-4 py-2 bg-[#21262D] text-white rounded-lg border border-gray-600 focus:border-blue-500"
          />
        </div>

        <button className="w-full bg-green-500 text-white py-2 rounded-lg font-semibold hover:bg-green-600 transition">
          Sign Up
        </button>

        <p className="text-gray-400 text-center mt-4">
          Already have an account?{" "}
          <Link to="/" className="text-blue-400 cursor-pointer hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
