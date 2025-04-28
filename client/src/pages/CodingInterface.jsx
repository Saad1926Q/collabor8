import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Editor from "@monaco-editor/react";

const CodingInterface = () => {
  const [fileStructure, setFileStructure] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [code, setCode] = useState("");
  const [repoName, setRepoName] = useState("");
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [repoUrl, setRepoUrl] = useState("");
  const [cloneMessage, setCloneMessage] = useState("");

  const users = ["Ayan Alam", "Saboor", "Sameer", "Ali", "Saad"];
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
          setShowCloneModal(true);
        } else {
          setFileStructure(data.structure);
          setRepoName(data.repoName);
          console.log(data)
        }
      })
      .catch((err) => {
        console.error("Error fetching repo structure:", err);
        setShowCloneModal(true);
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
        setShowCloneModal(false);
        window.location.reload();
      }
    } catch (error) {
      console.error("Error cloning repo:", error);
      setCloneMessage("Failed to clone repository.");
    }
  };

  const handleFileClick = (filePath) => {
    const encodedFilePath = encodeURIComponent(filePath);
  
    fetch(`http://localhost:5000/api/git/file?filePath=${encodedFilePath}`)
      .then((res) => res.json())
      .then((data) => {
        setCode(data.content);
        setSelectedFile(filePath);
      })
      .catch((err) => console.error("Error loading file:", err));
  };
  

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {showCloneModal && (
        <CloneModal
          repoUrl={repoUrl}
          setRepoUrl={setRepoUrl}
          handleClone={handleClone}
          cloneMessage={cloneMessage}
        />
      )}
      {!showCloneModal && (
        <>
          <Header />
          <div className="flex flex-1">
            <FileDirectory fileStructure={fileStructure} handleFileClick={handleFileClick} />
            <MainEditor code={code} setCode={setCode} />
            <ChatSidebar users={users} messages={messages} />
          </div>
        </>
      )}
    </div>
  );
};

const CloneModal = ({ repoUrl, setRepoUrl, handleClone, cloneMessage }) => (
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
      <button onClick={handleClone} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        Clone Repository
      </button>
      {cloneMessage && <p className="mt-2 text-red-400">{cloneMessage}</p>}
    </div>
  </div>
);

CloneModal.propTypes = {
  repoUrl: PropTypes.string.isRequired,
  setRepoUrl: PropTypes.func.isRequired,
  handleClone: PropTypes.func.isRequired,
  cloneMessage: PropTypes.string,
};

const Header = () => (
  <header className="flex justify-between items-center p-4 bg-gray-800 border-b border-gray-700">
    <a href="/" className="text-xl font-bold text-blue-500 hover:text-blue-400">Collabor8</a>
    <div>
      <button className="bg-green-500 px-4 py-2 rounded mr-2 hover:bg-green-600">Connected</button>
      <button className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600">Share</button>
    </div>
  </header>
);

const FileDirectory = ({ fileStructure, handleFileClick }) => (
  <aside className="w-1/5 bg-gray-800 p-4 border-r border-gray-700">
    <h3 className="text-lg font-bold mb-4">Files</h3>
    {renderFileStructure(fileStructure, handleFileClick)}
  </aside>
);

FileDirectory.propTypes = {
  fileStructure: PropTypes.array.isRequired,
  handleFileClick: PropTypes.func.isRequired,
};

const renderFileStructure = (files, handleFileClick, level = 0) => {
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
          {file.type === "folder" && file.children && renderFileStructure(file.children, handleFileClick, level + 1)}
        </li>
      ))}
    </ul>
  );
};

const MainEditor = ({ code, setCode }) => (
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
);

MainEditor.propTypes = {
  code: PropTypes.string.isRequired,
  setCode: PropTypes.func.isRequired,
};

const ChatSidebar = ({ users, messages }) => (
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
      <button className="ml-2 bg-blue-500 p-2 rounded text-white hover:bg-blue-600">✉</button>
    </div>
  </aside>
);

ChatSidebar.propTypes = {
  users: PropTypes.array.isRequired,
  messages: PropTypes.array.isRequired,
};

export default CodingInterface;