import { useState } from "react";

const RepoClone = () => {
  const [repoUrl, setRepoUrl] = useState("");
  const [message, setMessage] = useState("");

  const handleClone = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/git/clone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl }),
      });

      const data = await response.json();
      setMessage(data.message || data.error);
    } catch (error) {
      console.error("Error cloning repo:", error);
      setMessage("Failed to clone repository.");
    }
  };

  return (
    <div className="p-4">
      <input
        type="text"
        placeholder="Enter GitHub Repo URL"
        value={repoUrl}
        onChange={(e) => setRepoUrl(e.target.value)}
        className="border p-2 w-full"
      />
      <button onClick={handleClone} className="bg-blue-500 text-white p-2 mt-2">
        Clone Repository
      </button>
      {message && <p className="mt-2">{message}</p>}
    </div>
  );
};

export default RepoClone;
