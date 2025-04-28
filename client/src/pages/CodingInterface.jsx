import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import Editor from "@monaco-editor/react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import * as monaco from "monaco-editor";

// Generate a random color for the user
const getRandomColor = () => {
  const colors = [
    "#FF5733", // Red
    "#33FF57", // Green
    "#3357FF", // Blue
    "#FF33A8", // Pink
    "#33FFF5", // Cyan
    "#F5FF33", // Yellow
    "#FF8333", // Orange
    "#8333FF", // Purple
    "#33FF8B", // Mint
    "#FF33F5"  // Magenta
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

const CodingInterface = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const socketRef = useRef(null);
  const decorationsRef = useRef([]);
  const userCursorsRef = useRef({});
  const userColorsRef = useRef({});
  const userContributionsRef = useRef({});
  
  const [fileStructure, setFileStructure] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [code, setCode] = useState("");
  const [repoName, setRepoName] = useState("");
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [repoUrl, setRepoUrl] = useState("");
  const [cloneMessage, setCloneMessage] = useState("");
  const [roomInfo, setRoomInfo] = useState(null);
  const [roomMembers, setRoomMembers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [userData, setUserData] = useState(null);
  const [userColor, setUserColor] = useState(getRandomColor());

  // Initialize socket connection
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    // Fetch user data
    const fetchUserData = async () => {
      try {
        const response = await axios.get("http://localhost:5001/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUserData(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        navigate("/");
      }
    };

    fetchUserData();

    // Fetch room information
    if (roomId) {
      const fetchRoomInfo = async () => {
        try {
          const response = await axios.get(`http://localhost:5001/api/rooms/${roomId}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          setRoomInfo(response.data.room);
          setRoomMembers(response.data.members || []);
        } catch (error) {
          console.error("Error fetching room info:", error);
          navigate("/dashboard");
        }
      };

      fetchRoomInfo();
    }

  // Fetch repository structure
  const fetchRepoStructure = async () => {
    try {
      const response = await axios.get(`http://localhost:5001/api/git/structure/${roomId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = response.data;
      if (data.structure.length === 0) {
        setShowCloneModal(true);
      } else {
        setFileStructure(data.structure);
        setRepoName(data.repoName);
        
        // Find the first file to select by default
        const findFirstFile = (items) => {
          for (const item of items) {
            if (item.type === 'file') {
              return item.path;
            } else if (item.type === 'folder' && item.children && item.children.length > 0) {
              const filePath = findFirstFile(item.children);
              if (filePath) return filePath;
            }
          }
          return null;
        };
        
        const firstFilePath = findFirstFile(data.structure);
        if (firstFilePath) {
          // Load the first file by default
          handleFileClick(firstFilePath);
        }
      }
    } catch (error) {
      console.error("Error fetching repo structure:", error);
      setShowCloneModal(true);
    }
  };

    fetchRepoStructure();

    // Initialize socket connection
    socketRef.current = io("http://localhost:5001");
    
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [roomId, navigate]);

  // Join room when socket and user data are available
  useEffect(() => {
    if (socketRef.current && userData && roomId) {
      // Join the room
      socketRef.current.emit('join-room', {
        roomId,
        userId: userData.id,
        username: userData.name,
        color: userColor
      });
      
      // Listen for new users joining
      socketRef.current.on('user-joined', (user) => {
        console.log('User joined:', user);
        userColorsRef.current[user.userId] = user.color;
        updateCursors();
      });
      
      // Get current users in the room
      socketRef.current.on('current-users', (users) => {
        console.log('Current users:', users);
        users.forEach(user => {
          userColorsRef.current[user.userId] = user.color;
        });
        updateCursors();
      });
      
      // Listen for cursor updates
      socketRef.current.on('cursor-update', (data) => {
        userCursorsRef.current[data.userId] = {
          position: data.cursor,
          username: data.username,
          color: data.color,
          selection: userCursorsRef.current[data.userId]?.selection
        };
        updateCursors();
      });
      
      // Listen for selection updates
      socketRef.current.on('selection-update', (data) => {
        if (!userCursorsRef.current[data.userId]) {
          userCursorsRef.current[data.userId] = {
            position: { line: 1, column: 1 },
            username: data.username,
            color: data.color
          };
        }
        
        userCursorsRef.current[data.userId].selection = data.selection;
        updateCursors();
      });
      
      // Listen for code updates
      socketRef.current.on('code-update', (data) => {
        if (editorRef.current && selectedFile && data.filename === selectedFile) {
          // Apply changes to editor
          const model = editorRef.current.getModel();
          if (model) {
            // Track user contributions for this section
            if (!userContributionsRef.current[selectedFile]) {
              userContributionsRef.current[selectedFile] = {};
            }
            
            // Update the model with the changes
            if (data.changes) {
              // Temporarily remove our own change listener to avoid echo
              const prevValue = code;
              setCode(data.changes);
              
              // Track which lines were modified by which user
              const lines = data.changes.split('\n');
              lines.forEach((line, index) => {
                userContributionsRef.current[selectedFile][index] = {
                  userId: data.userId,
                  username: data.username,
                  color: data.color
                };
              });
              
              // Apply decorations for user contributions
              setTimeout(() => {
                applyContributionDecorations();
              }, 50);
            }
          }
        }
      });
      
      // Listen for chat messages
      socketRef.current.on('chat-history', (messages) => {
        setMessages(messages);
      });
      
      socketRef.current.on('receive-message', (message) => {
        setMessages(prevMessages => [...prevMessages, message]);
      });
      
      // Listen for users leaving
      socketRef.current.on('user-left', (user) => {
        console.log('User left:', user);
        delete userCursorsRef.current[user.userId];
        updateCursors();
      });
    }
    
    return () => {
      if (socketRef.current) {
        socketRef.current.off('user-joined');
        socketRef.current.off('current-users');
        socketRef.current.off('cursor-update');
        socketRef.current.off('code-update');
        socketRef.current.off('chat-history');
        socketRef.current.off('receive-message');
        socketRef.current.off('user-left');
      }
    };
  }, [socketRef.current, userData, roomId, userColor, selectedFile]);

  // Function to update cursor decorations
  const updateCursors = () => {
    if (!editorRef.current) return;
    
    // Remove existing decorations
    decorationsRef.current = editorRef.current.deltaDecorations(
      decorationsRef.current,
      []
    );
    
    // Create new decorations for each user's cursor and selections
    const decorations = [];
    
    Object.entries(userCursorsRef.current).forEach(([userId, cursor]) => {
      const { position, username, color, selection } = cursor;
      
      // Add cursor decoration
      decorations.push({
        range: new monaco.Range(
          position.line,
          position.column,
          position.line,
          position.column + 1
        ),
        options: {
          className: 'cursor-decoration',
          hoverMessage: { value: `${username} is editing` },
          inlineClassName: `cursor-${userId}`,
          beforeContentClassName: 'cursor-line',
          before: {
            content: '|',
          },
          after: {
            content: username,
            inlineClassName: 'cursor-label'
          },
          minimap: {
            color: color,
            position: 2
          }
        }
      });
      
      // Add selection decoration if it exists
      if (selection && 
          selection.startLineNumber && 
          selection.startColumn && 
          selection.endLineNumber && 
          selection.endColumn) {
        decorations.push({
          range: new monaco.Range(
            selection.startLineNumber,
            selection.startColumn,
            selection.endLineNumber,
            selection.endColumn
          ),
          options: {
            className: `selection-${userId}`,
            hoverMessage: { value: `Selected by ${username}` },
            inlineClassName: `selection-inline-${userId}`
          }
        });
      }
    });
    
    // Apply the decorations
    if (editorRef.current) {
      // Add global cursor styles if not already added
      if (!document.getElementById('cursor-styles')) {
        const style = document.createElement('style');
        style.id = 'cursor-styles';
        
        // Generate styles for each user's cursor and selection
        let userStyles = '';
        Object.entries(userCursorsRef.current).forEach(([userId, cursor]) => {
          const { color } = cursor;
          userStyles += `
            .cursor-${userId} {
              background-color: ${color};
              width: 2px !important;
              margin-left: 0;
              animation: blink 1s infinite;
            }
            .selection-${userId} {
              background-color: ${color}30 !important;
            }
            .selection-inline-${userId} {
              background-color: ${color}30 !important;
            }
          `;
        });
        
        style.innerHTML = `
          .cursor-decoration {
            position: relative;
          }
          .cursor-line {
            position: absolute;
            width: 2px;
            height: 18px;
          }
          .cursor-label {
            position: absolute;
            top: -18px;
            left: 0;
            background-color: #333;
            color: white;
            padding: 2px 4px;
            border-radius: 2px;
            font-size: 10px;
            white-space: nowrap;
            z-index: 100;
          }
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          ${userStyles}
        `;
        document.head.appendChild(style);
      }
      
      decorationsRef.current = editorRef.current.deltaDecorations(
        decorationsRef.current,
        decorations
      );
    }
  };
  
  // Function to apply decorations for user contributions
  const applyContributionDecorations = () => {
    if (!editorRef.current || !selectedFile) return;
    
    const model = editorRef.current.getModel();
    if (!model) return;
    
    const fileContributions = userContributionsRef.current[selectedFile] || {};
    const decorations = [];
    
    // Add global contribution styles if not already added
    if (!document.getElementById('contribution-styles')) {
      const style = document.createElement('style');
      style.id = 'contribution-styles';
      
      // Generate styles for each user's contributions
      let contributionStyles = '';
      Object.values(fileContributions).forEach(contribution => {
        contributionStyles += `
          .contribution-${contribution.userId} {
            background-color: ${contribution.color}20 !important;
            border-left: 4px solid ${contribution.color} !important;
          }
        `;
      });
      
      style.innerHTML = contributionStyles;
      document.head.appendChild(style);
    }
    
    // Create decorations for each line based on who contributed it
    Object.entries(fileContributions).forEach(([lineNumber, contribution]) => {
      // Only add decoration if the line exists in the model
      if (parseInt(lineNumber) + 1 <= model.getLineCount()) {
        // Format the timestamp if it exists
        let hoverMessage = `Contributed by: ${contribution.username}`;
        if (contribution.timestamp) {
          const date = new Date(contribution.timestamp);
          const formattedDate = date.toLocaleDateString();
          const formattedTime = date.toLocaleTimeString();
          hoverMessage += `\nModified: ${formattedDate} at ${formattedTime}`;
        }
        
        decorations.push({
          range: new monaco.Range(
            parseInt(lineNumber) + 1,
            1,
            parseInt(lineNumber) + 1,
            model.getLineLength(parseInt(lineNumber) + 1) + 1
          ),
          options: {
            isWholeLine: true,
            className: `contribution-${contribution.userId}`,
            hoverMessage: { value: hoverMessage }
          }
        });
      }
    });
    
    // Apply the decorations
    if (editorRef.current) {
      editorRef.current.deltaDecorations([], decorations);
    }
  };

  const handleClone = async () => {
    try {
      const token = localStorage.getItem("token");
      
      const response = await axios.post("http://localhost:5001/api/git/clone", {
        repoUrl,
        roomId
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      setCloneMessage(response.data.message || "Repository cloned successfully");

      if (response.status === 200) {
        setShowCloneModal(false);
        window.location.reload();
      }
    } catch (error) {
      console.error("Error cloning repo:", error);
      setCloneMessage(error.response?.data?.error || "Failed to clone repository.");
    }
  };

  const handleFileClick = (filePath) => {
    const encodedFilePath = encodeURIComponent(filePath);
    const token = localStorage.getItem("token");
  
    axios.get(`http://localhost:5001/api/git/file/${roomId}?filePath=${encodedFilePath}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((response) => {
        setCode(response.data.content);
        setSelectedFile(filePath);
        
        // Reset user contributions for this file if not already tracked
        if (!userContributionsRef.current[filePath]) {
          userContributionsRef.current[filePath] = {};
        }
        
        // Apply decorations for user contributions
        setTimeout(() => {
          applyContributionDecorations();
        }, 100);
      })
      .catch((err) => console.error("Error loading file:", err));
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
    
    // Set up cursor position tracking
    editor.onDidChangeCursorPosition((e) => {
      if (socketRef.current && userData && roomId) {
        socketRef.current.emit('cursor-move', {
          roomId,
          line: e.position.lineNumber,
          column: e.position.column
        });
      }
    });
    
    // Track text selection
    editor.onDidChangeCursorSelection((e) => {
      if (socketRef.current && userData && roomId) {
        // Only emit if there's an actual selection (not just cursor position)
        if (e.selection.startLineNumber !== e.selection.endLineNumber || 
            e.selection.startColumn !== e.selection.endColumn) {
          socketRef.current.emit('selection-change', {
            roomId,
            selection: {
              startLineNumber: e.selection.startLineNumber,
              startColumn: e.selection.startColumn,
              endLineNumber: e.selection.endLineNumber,
              endColumn: e.selection.endColumn
            }
          });
        } else {
          // Clear selection
          socketRef.current.emit('selection-change', {
            roomId,
            selection: null
          });
        }
      }
    });
    
    // Add custom CSS for better cursor visibility
    const style = document.createElement('style');
    style.innerHTML = `
      .cursor-decoration {
        position: absolute;
        pointer-events: none;
        z-index: 100;
        animation: blink 1s infinite;
      }
      
      @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      
      .monaco-editor .line-contribution {
        transition: background-color 0.3s ease;
      }
      
      .user-selection {
        opacity: 0.5;
      }
    `;
    document.head.appendChild(style);
  };

  const handleCodeChange = (value) => {
    // Don't update if the value hasn't changed
    if (value === code) return;
    
    setCode(value);
    
    // Send code changes to server via socket
    if (socketRef.current && userData && roomId && selectedFile) {
      socketRef.current.emit('code-change', {
        roomId,
        changes: value,
        filename: selectedFile
      });
      
      // Initialize contributions for this file if needed
      if (!userContributionsRef.current[selectedFile]) {
        userContributionsRef.current[selectedFile] = {};
      }
      
      // Find which lines were modified by comparing with previous code
      const oldLines = code.split('\n');
      const newLines = value.split('\n');
      
      // Only track lines that have changed
      newLines.forEach((line, index) => {
        if (index >= oldLines.length || line !== oldLines[index]) {
          userContributionsRef.current[selectedFile][index] = {
            userId: userData.id,
            username: userData.name,
            color: userColor,
            timestamp: Date.now() // Add timestamp to track when the change was made
          };
        }
      });
      
      // Apply decorations for user contributions
      setTimeout(() => {
        applyContributionDecorations();
      }, 10);
    }
  };
  
  const handleSendMessage = () => {
    if (!newMessage.trim() || !socketRef.current || !userData || !roomId) return;
    
    socketRef.current.emit('send-message', {
      roomId,
      message: newMessage
    });
    
    setNewMessage('');
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
          <Header roomInfo={roomInfo} />
          <div className="flex flex-1 overflow-hidden">
            <FileDirectory fileStructure={fileStructure} handleFileClick={handleFileClick} />
            <div className="flex-1 flex flex-col">
              <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex items-center">
                <span className="text-gray-400 mr-2">Current file:</span>
                <span className="text-blue-400 font-mono">{selectedFile || "No file selected"}</span>
                {selectedFile && (
                  <div className="ml-auto flex items-center">
                    <span className="text-xs text-gray-400 mr-2">Collaborating with {Object.keys(userColorsRef.current).length} users</span>
                    {userData && roomInfo && userData.id === roomInfo.owner_id && (
                      <button 
                        className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 rounded flex items-center"
                        onClick={() => {
                          // Commit functionality would go here
                          const commitMessage = prompt("Enter commit message:");
                          if (commitMessage) {
                            alert(`Changes committed with message: ${commitMessage}`);
                          }
                        }}
                      >
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM4.5 7.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H4.5z"/>
                        </svg>
                        Commit Changes
                      </button>
                    )}
                  </div>
                )}
              </div>
              <MainEditor 
                code={code} 
                onChange={handleCodeChange} 
                onMount={handleEditorDidMount}
              />
            </div>
            <ChatSidebar 
              roomMembers={roomMembers} 
              messages={messages} 
              roomInfo={roomInfo}
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              handleSendMessage={handleSendMessage}
              userData={userData}
              roomId={roomId}
              mainSocketRef={socketRef}
            />
          </div>
        </>
      )}
    </div>
  );
};

const CloneModal = ({ repoUrl = "", setRepoUrl, handleClone, cloneMessage }) => (
  <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-80">
    <div className="bg-gray-700 p-6 rounded-lg shadow-lg w-1/3">
      <h2 className="text-lg font-bold mb-4">Clone a GitHub Repository</h2>
      <input
        type="text"
        placeholder="Enter GitHub Repo URL"
        value={repoUrl || ""}
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
  repoUrl: PropTypes.string,
  setRepoUrl: PropTypes.func.isRequired,
  handleClone: PropTypes.func.isRequired,
  cloneMessage: PropTypes.string,
};

const Header = ({ roomInfo }) => {
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate('/dashboard');
  };
  
  return (
    <header className="flex justify-between items-center p-4 bg-gray-800 border-b border-gray-700">
      <div className="flex items-center">
        <button 
          onClick={handleBack}
          className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded mr-4 flex items-center"
        >
          <span className="mr-1">←</span> Back to Dashboard
        </button>
        {roomInfo && <span className="text-gray-300 font-semibold text-lg">{roomInfo.name}</span>}
      </div>
      <div>
        <button className="bg-green-500 px-4 py-2 rounded mr-2 hover:bg-green-600">Connected</button>
        {roomInfo && (
          <button 
            className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600"
            onClick={() => {
              navigator.clipboard.writeText(roomInfo.invite_id);
              alert('Invite code copied to clipboard!');
            }}
          >
            Copy Invite Code
          </button>
        )}
      </div>
    </header>
  );
};

Header.propTypes = {
  roomInfo: PropTypes.object
};

const FileDirectory = ({ fileStructure, handleFileClick }) => {
  const [expandedFolders, setExpandedFolders] = useState({});
  
  const toggleFolder = (path) => {
    setExpandedFolders(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };
  
  return (
    <aside className="w-1/5 bg-gray-800 p-4 border-r border-gray-700 overflow-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">Files</h3>
        <button 
          className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded"
          onClick={() => setExpandedFolders({})}
        >
          Collapse All
        </button>
      </div>
      <div className="search-box mb-4">
        <input 
          type="text" 
          placeholder="Search files..." 
          className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 text-sm"
        />
      </div>
      {renderFileStructure(fileStructure, handleFileClick, expandedFolders, toggleFolder)}
    </aside>
  );
};

FileDirectory.propTypes = {
  fileStructure: PropTypes.array.isRequired,
  handleFileClick: PropTypes.func.isRequired,
};

const renderFileStructure = (files, handleFileClick, expandedFolders, toggleFolder, path = "", level = 0) => {
  if (!files || !Array.isArray(files)) {
    return <div className="text-gray-400 italic text-sm">No files available</div>;
  }

  return (
    <ul className="file-tree">
      {files.map((file, index) => {
        const filePath = path ? `${path}/${file.name}` : file.name;
        const isExpanded = expandedFolders[filePath] !== false; // Default to expanded
        
        return (
          <li key={index} className={`py-1 px-1 rounded ${file.type === 'file' ? 'hover:bg-gray-700' : ''}`}>
            <div 
              className={`flex items-center cursor-pointer ${file.type === 'file' ? 'pl-4' : ''}`}
              onClick={() => {
                if (file.type === 'folder') {
                  toggleFolder(filePath);
                } else {
                  handleFileClick(file.path);
                }
              }}
            >
              {file.type === 'folder' && (
                <span className="mr-1 text-gray-400 inline-block w-4">
                  {isExpanded ? '▼' : '►'}
                </span>
              )}
              <span className={`mr-2 ${file.type === 'file' ? 'text-blue-300' : 'text-yellow-300'}`}>
                {file.type === 'folder' ? '📂' : getFileIcon(file.name)}
              </span>
              <span className={`text-sm ${file.type === 'file' ? 'text-gray-300' : 'text-white font-medium'}`}>
                {file.name}
              </span>
            </div>
            {file.type === 'folder' && file.children && isExpanded && (
              <div className="ml-4 mt-1 border-l border-gray-700 pl-2">
                {renderFileStructure(file.children, handleFileClick, expandedFolders, toggleFolder, filePath, level + 1)}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
};

// Helper function to get appropriate icon based on file extension
const getFileIcon = (filename) => {
  const ext = filename.split('.').pop().toLowerCase();
  
  const iconMap = {
    js: '📄 JS',
    jsx: '📄 JSX',
    ts: '📄 TS',
    tsx: '📄 TSX',
    html: '📄 HTML',
    css: '📄 CSS',
    json: '📄 JSON',
    md: '📄 MD',
    py: '📄 PY',
    java: '📄 JAVA',
    c: '📄 C',
    cpp: '📄 C++',
    go: '📄 GO',
    rb: '📄 RB',
    php: '📄 PHP',
    sql: '📄 SQL',
    // Add more as needed
  };
  
  return iconMap[ext] || '📄';
};

const MainEditor = ({ code, onChange, onMount }) => (
  <main className="flex-1 flex flex-col overflow-hidden">
    <Editor
      height="75vh"
      theme="vs-dark"
      defaultLanguage="javascript"
      value={code}
      onChange={onChange}
      onMount={onMount}
      options={{
        minimap: { enabled: true },
        scrollBeyondLastLine: false,
        fontSize: 14,
        wordWrap: 'on',
        automaticLayout: true,
        contextmenu: true,
        lineNumbers: "on",
        renderLineHighlight: "all",
        cursorBlinking: "smooth",
        cursorSmoothCaretAnimation: "on",
        scrollbar: {
          vertical: 'visible',
          horizontal: 'visible',
          useShadows: true,
          verticalHasArrows: false,
          horizontalHasArrows: false,
          alwaysConsumeMouseWheel: false
        }
      }}
    />
    <div className="bg-gray-800 text-green-400 p-4 h-24 overflow-auto border-t border-gray-700 font-mono text-sm">
      <div className="flex items-center mb-1">
        <span className="bg-green-500 w-2 h-2 rounded-full mr-2"></span>
        <p>Server connected and running</p>
      </div>
      <p>$ Collaborative editing active</p>
      <p>&gt; Changes are automatically synced with collaborators</p>
    </div>
  </main>
);

MainEditor.propTypes = {
  code: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onMount: PropTypes.func.isRequired
};

const ChatSidebar = ({ roomMembers, messages, roomInfo, newMessage, setNewMessage, handleSendMessage, userData, roomId, mainSocketRef }) => {
  const messagesEndRef = useRef(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  
  // Scroll to bottom of messages when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Update online users based on socket events
  useEffect(() => {
    // Use the main socket connection
    if (!mainSocketRef.current) return;
    
    // Set all users as online initially
    const online = new Set();
    roomMembers.forEach(member => {
      online.add(member.id);
    });
    setOnlineUsers(online);
    
    // Function to handle user activity
    const handleUserActive = (data) => {
      console.log('User active:', data);
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.add(data.userId);
        return newSet;
      });
    };
    
    // Function to handle user leaving
    const handleUserLeft = (data) => {
      console.log('User left:', data);
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
    };
    
    // Listen for user activity and left events
    mainSocketRef.current.on('user-active', handleUserActive);
    mainSocketRef.current.on('user-left', handleUserLeft);
    mainSocketRef.current.on('user-joined', user => {
      console.log('User joined:', user);
      handleUserActive({ userId: user.userId });
    });
    
    // Emit a heartbeat every 30 seconds to keep user status updated
    const heartbeatInterval = setInterval(() => {
      if (mainSocketRef.current && userData && roomId) {
        mainSocketRef.current.emit('user-active', {
          roomId,
          userId: userData.id,
          timestamp: Date.now()
        });
      }
    }, 30000);
    
    // Clean up event listeners and interval
    return () => {
      if (mainSocketRef.current) {
        mainSocketRef.current.off('user-active', handleUserActive);
        mainSocketRef.current.off('user-left', handleUserLeft);
        mainSocketRef.current.off('user-joined');
      }
      clearInterval(heartbeatInterval);
    };
  }, [roomMembers, userData, roomId, mainSocketRef]);

  return (
    <aside className="w-1/5 bg-gray-800 p-4 border-l border-gray-700 flex flex-col">
      {roomInfo && (
        <div className="mb-4 pb-2 border-b border-gray-700">
          <h3 className="text-lg font-bold">{roomInfo.name}</h3>
          <p className="text-xs text-gray-400">Room ID: {roomInfo.invite_id}</p>
        </div>
      )}
      
      <h3 className="text-md font-bold mb-2">Users</h3>
      <ul className="mb-4 max-h-32 overflow-y-auto">
        {roomMembers.map((member) => (
          <li key={member.id} className="py-1 px-2 rounded hover:bg-gray-700 flex items-center justify-between">
            <div className="flex items-center">
              <span 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: member.color || '#888' }}
              ></span>
              <span>{member.name} {member.role === 'leader' && 
                <span className="text-xs text-gray-400 ml-1">(Owner)</span>}
              </span>
            </div>
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${onlineUsers.has(member.id) ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-300'}`}>
              {onlineUsers.has(member.id) ? 'Online' : 'Offline'}
            </span>
          </li>
        ))}
      </ul>
      <h3 className="text-md font-bold mb-2 border-t border-gray-700 pt-2">Chat</h3>
      <div className="flex-1 overflow-auto border-t border-gray-700 p-2">
        {messages.map((msg, index) => (
          <div key={index} className="text-sm mb-3">
            <div className="flex items-center">
              <span className="font-bold">{msg.user}:</span>
              <span className="text-xs text-gray-400 ml-2">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p className="pl-2 border-l-2 border-gray-600">{msg.text}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="mt-2 flex border-t border-gray-700 p-2">
        <textarea 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 p-2 bg-gray-700 text-white rounded resize-none" 
          placeholder="Type a message..." 
          rows={2}
        />
        <button 
          onClick={handleSendMessage}
          className="ml-2 bg-blue-500 p-2 rounded text-white hover:bg-blue-600 self-end"
        >
          ✉
        </button>
      </div>
    </aside>
  );
};

ChatSidebar.propTypes = {
  roomMembers: PropTypes.array.isRequired,
  messages: PropTypes.array.isRequired,
  roomInfo: PropTypes.object,
  newMessage: PropTypes.string.isRequired,
  setNewMessage: PropTypes.func.isRequired,
  handleSendMessage: PropTypes.func.isRequired,
  userData: PropTypes.object,
  roomId: PropTypes.string,
  mainSocketRef: PropTypes.object
};

export default CodingInterface;
