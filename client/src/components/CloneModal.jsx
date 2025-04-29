import React from 'react';
import PropTypes from 'prop-types';

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

export default CloneModal;
