const Settings = () => {
    return (
      <div className="flex h-screen bg-gray-900 text-white">
        {/* Sidebar */}
        <aside className="w-1/5 bg-gray-800 p-4 border-r border-gray-700">
          <a href="/" className="text-xl font-bold mb-8 block">Collabor8</a>
          <nav>
            <ul>
              <li className="py-2 px-4 rounded hover:bg-gray-700">Dashboard</li>
              <li className="py-2 px-4 rounded hover:bg-gray-700">Projects</li>
              <li className="py-2 px-4 rounded hover:bg-gray-700">Team</li>
              <li className="py-2 px-4 rounded bg-blue-600">Settings</li>
            </ul>
          </nav>
        </aside>
  
        {/* Main Content */}
        <main className="flex-1 p-6">
          <h1 className="text-2xl font-bold mb-6">User Settings</h1>
          
          <div className="flex gap-6 mb-6">
            {/* Profile Section */}
            <div className="w-1/3 bg-gray-800 p-6 rounded-lg shadow-md flex flex-col items-center">
              <div className="w-24 h-24 bg-gray-600 rounded-full mb-4"></div>
              <h2 className="text-xl font-bold">Ali Mehdi Naqvi</h2>
              <p className="text-gray-400">Senior Frontend Engineer</p>
            </div>
            
            {/* User Details Form */}
            <div className="w-2/3 bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-bold mb-4">Profile Information</h3>
              <form>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <input type="text" placeholder="First Name" className="p-2 bg-gray-700 rounded w-full" />
                  <input type="text" placeholder="Last Name" className="p-2 bg-gray-700 rounded w-full" />
                </div>
                <input type="email" placeholder="Email Address" className="p-2 bg-gray-700 rounded w-full mb-4" />
                <textarea placeholder="Bio" className="p-2 bg-gray-700 rounded w-full mb-4"></textarea>
                <input type="text" placeholder="GitHub Profile" className="p-2 bg-gray-700 rounded w-full mb-4" />
                <button className="bg-blue-600 px-4 py-2 rounded">Save Changes</button>
              </form>
            </div>
          </div>
  
          {/* Preferences Section */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-bold mb-4">Preferences</h3>
            <div className="flex justify-between items-center mb-4">
              <span>Email Notifications</span>
              <input type="checkbox" className="toggle" />
            </div>
            <div className="flex justify-between items-center">
              <span>Dark Mode</span>
              <input type="checkbox" className="toggle" />
            </div>
          </div>
        </main>
      </div>
    );
  };
  
  export default Settings;
  
  