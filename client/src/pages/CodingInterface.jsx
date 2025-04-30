import FileDirectory from "../components/FileDirectory";
import Header from "../components/Header";
import CloneModal from "../components/CloneModal";
import MainEditor from "../components/MainEditor";
import ChatSidebar from "../components/ChatSidebar";
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { io } from "socket.io-client";
import * as monaco from "monaco-editor";
import PropTypes from "prop-types";
import axios from "axios";



const socket = io()


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
      });
  
      // Get current users in the room
      socketRef.current.on('current-users', (users) => {
        console.log('Current users:', users);
      });
  
      // Chat history
      socketRef.current.on('chat-history', (messages) => {
        setMessages(messages);
      });
  
      // New chat message
      socketRef.current.on('receive-message', (message) => {
        setMessages(prevMessages => [...prevMessages, message]);
      });
  
      // Handle user leave
      socketRef.current.on('user-left', (user) => {
        console.log('User left:', user);
      });
    }
  
    return () => {
      if (socketRef.current) {
        socketRef.current.off('user-joined');
        socketRef.current.off('current-users');
        socketRef.current.off('chat-history');
        socketRef.current.off('receive-message');
        socketRef.current.off('user-left');
      }
    };
  }, [socketRef.current, userData, roomId, userColor]);
  

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


export default CodingInterface;
