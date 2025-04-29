import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { renderFileStructure } from '../utils/FileUtils';

const FileDirectory = ({ fileStructure, handleFileClick }) => {
  const [expandedFolders, setExpandedFolders] = useState({});

  const toggleFolder = (path) => {
    setExpandedFolders(prev => ({ ...prev, [path]: !prev[path] }));
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

export default FileDirectory;
