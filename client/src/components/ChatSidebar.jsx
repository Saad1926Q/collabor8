import React, { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const ChatSidebar = ({ roomMembers, messages, roomInfo, newMessage, setNewMessage, handleSendMessage, userData, roomId, mainSocketRef }) => {
  const messagesEndRef = useRef(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    if (!mainSocketRef.current) return;

    const online = new Set();
    roomMembers.forEach(member => {
      online.add(member.id);
    });
    setOnlineUsers(online);

    const handleUserActive = (data) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.add(data.userId);
        return newSet;
      });
    };

    const handleUserLeft = (data) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
    };

    mainSocketRef.current.on('user-active', handleUserActive);
    mainSocketRef.current.on('user-left', handleUserLeft);
    mainSocketRef.current.on('user-joined', user => {
      handleUserActive({ userId: user.userId });
    });

    const heartbeatInterval = setInterval(() => {
      if (mainSocketRef.current && userData && roomId) {
        mainSocketRef.current.emit('user-active', {
          roomId,
          userId: userData.id,
          timestamp: Date.now()
        });
      }
    }, 30000);

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
              <span>{member.name} {member.role === 'leader' && <span className="text-xs text-gray-400 ml-1">(Owner)</span>}</span>
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

export default ChatSidebar;
