import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

const Header = ({ roomInfo }) => {
  const navigate = useNavigate();
  
  const handleBack = () => navigate('/dashboard');

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

export default Header;
