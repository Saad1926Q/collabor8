import { useState } from "react";

const Dashboard = () => {
  const stats = [
    { label: "Active Projects", value: 12, description: "Currently in progress" },
    { label: "Team Members", value: 8, description: "Collaborating" },
    { label: "Code Changes", value: 234, description: "Last 7 days" },
    { label: "Pull Requests", value: 15, description: "Pending review" },
  ];

  const activities = [
    { text: "Updated main repository", time: "2 hours ago" },
    { text: "Created new branch", time: "5 hours ago" },
    { text: "Merged pull request", time: "8 hours ago" },
  ];

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <aside className="w-1/5 bg-gray-800 p-4 border-r border-gray-700">
        <a href="/" className="text-xl font-bold mb-8 block">CodeCollab</a>
        <nav>
          <ul>
            <li className="py-2 px-4 rounded bg-blue-600">Dashboard</li>
            <li className="py-2 px-4 rounded hover:bg-gray-700">Projects</li>
            <li className="py-2 px-4 rounded hover:bg-gray-700">Team</li>
            <li className="py-2 px-4 rounded hover:bg-gray-700">Settings</li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">Welcome back, Developer!</h1>

        {/* Stats Section */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-gray-800 p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-bold">{stat.label}</h3>
              <p className="text-2xl font-bold text-blue-500">{stat.value}</p>
              <p className="text-gray-400 text-sm">{stat.description}</p>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
          <ul>
            {activities.map((activity, index) => (
              <li key={index} className="py-2 border-b border-gray-700 last:border-none">
                <p>{activity.text}</p>
                <p className="text-gray-400 text-sm">{activity.time}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Activity Graph Placeholder */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md h-48 flex items-center justify-center">
          <p className="text-gray-400">Activity Graph (Placeholder)</p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
