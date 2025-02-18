import { useState,useEffect } from "react";
import Editor from "@monaco-editor/react";

const CodingInterface = () => {
  const [fileStructure, setFileStructure] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [code, setCode] = useState("");
  const [repoName, setRepoName] = useState("");
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [repoUrl, setRepoUrl] = useState("");
  const [cloneMessage, setCloneMessage] = useState("");

  const users = ["Ayan Alam", "Saboor", "Sameer","Ali","Saad"];
  const messages = [
    { user: "Ayan Alam", text: "I've updated the API endpoint." },
    { user: "Saboor", text: "Sure, I'll take a look now." },
    { user: "Sameer", text: "Finished working on bugfixes." },
    { user: "Saad", text: "Someone review the pull request." },
    { user: "Ali", text: "On it." },
  ];

  useEffect(() => {
    fetch(`http://localhost:5000/api/git/structure`)
      .then((res) => res.json())
      .then((data) => {
        if (data.structure.length === 0) {
          setShowCloneModal(true); // No repo found, show the modal
        } else {
          setFileStructure(data.structure);
          setRepoName(data.repoName);
        }
      })
      .catch((err) => {
        console.error("Error fetching repo structure:", err);
        setShowCloneModal(true); // Show modal if an error occurs (e.g., repo folder doesn't exist)
      });
  }, []);


  const handleClone = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/git/clone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl }),
      });

      const data = await response.json();
      setCloneMessage(data.message || data.error);

      if (response.ok) {
        setShowCloneModal(false); // Hide modal
        window.location.reload(); // Reload to fetch new repo structure
      }
    } catch (error) {
      console.error("Error cloning repo:", error);
      setCloneMessage("Failed to clone repository.");
    }
  };
  

  const renderFileStructure = (files, level = 0) => {
    if (!files || !Array.isArray(files)) {
      return <div>No files available</div>;
  }

    return (
      <ul className={`pl-${level * 4}`}>
        {files.map((file, index) => (
          <li key={index} className="py-1 px-2 rounded hover:bg-gray-700 cursor-pointer">
            <span onClick={() => file.type === "file" && handleFileClick(file.path)}>
              {file.type === "folder" ? "📂 " : "📄 "} {file.name}
            </span>
  
            {/* If the file is a folder, render its children recursively */}
            {file.type === "folder" && file.children && renderFileStructure(file.children, level + 1)}
          </li>
        ))}
      </ul>
    );
  };

  const handleFileClick = (filePath) => {
    fetch(`http://localhost:5000/api/git/file?repoName=myRepoName&filePath=${filePath}`)
      .then((res) => res.json())
      .then((data) => {
        console.log(data.content);  // Log the file content to console
        setCode(data.content);  // Set code for editor (optional)
        setSelectedFile(filePath);
      })
      .catch((err) => console.error("Error loading file:", err));
  };
  

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Clone Modal */}
      {showCloneModal && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-80">
          <div className="bg-gray-700 p-6 rounded-lg shadow-lg w-1/3">
            <h2 className="text-lg font-bold mb-4">Clone a GitHub Repository</h2>
            <input
              type="text"
              placeholder="Enter GitHub Repo URL"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              className="w-full p-2 mb-4 border rounded bg-gray-800 text-white"
            />
            <button onClick={handleClone} className="bg-blue-500 text-white px-4 py-2 rounded">
              Clone Repository
            </button>
            {cloneMessage && <p className="mt-2 text-red-400">{cloneMessage}</p>}
          </div>
        </div>
      )}

      {/* Normal Layout */}
      {!showCloneModal && (
        <>
          {/* Header */}
          <header className="flex justify-between items-center p-4 bg-gray-800 border-b border-gray-700">
            <a href="/" className="text-xl font-bold text-blue-500">Collabor8</a>
            <div>
              <button className="bg-green-500 px-4 py-2 rounded mr-2">Connected</button>
              <button className="bg-gray-700 px-4 py-2 rounded">Share</button>
            </div>
          </header>

          <div className="flex flex-1">
            {/* File Directory */}
            <aside className="w-1/5 bg-gray-800 p-4 border-r border-gray-700">
              <h3 className="text-lg font-bold mb-4">Files</h3>
              {renderFileStructure(fileStructure)}
            </aside>

            {/* Code Editor */}
            <main className="flex-1 flex flex-col">
              <Editor
                height="70vh"
                theme="vs-dark"
                defaultLanguage="javascript"
                value={code}
                onChange={(value) => setCode(value)}
              />
              <div className="bg-gray-800 text-green-400 p-4 h-24 overflow-auto border-t border-gray-700 font-mono">
                <p>$ Server started on port 3000</p>
                <p>&gt; GET / 200 OK - 0.5ms</p>
              </div>
            </main>
            <aside className="w-1/5 bg-gray-800 p-4 border-l border-gray-700 flex flex-col">
          <h3 className="text-lg font-bold mb-4">Users</h3>
          <ul className="mb-4">
            {users.map((user, index) => (
              <li key={index} className="py-1 px-2 rounded hover:bg-gray-700">
                {user}
              </li>
            ))}
          </ul>
          <div className="flex-1 overflow-auto border-t border-gray-700 p-2">
            {messages.map((msg, index) => (
              <p key={index} className="text-sm mb-2">
                <span className="font-bold">{msg.user}:</span> {msg.text}
              </p>
            ))}
          </div>
          <div className="mt-2 flex border-t border-gray-700 p-2">
            <input type="text" className="flex-1 p-2 bg-gray-700 text-white rounded" placeholder="Type a message..." />
            <button className="ml-2 bg-blue-500 p-2 rounded text-white">
              ✉
            </button>
          </div>
        </aside>
          </div>
        </>
      )}
    </div>
  );
};

export default CodingInterface;