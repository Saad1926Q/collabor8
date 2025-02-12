import { useState } from "react";
import Editor from "@monaco-editor/react";

const CodingInterface = () => {
  const [code, setCode] = useState(`console.log('Hello, world!');var solutions = [];
var target = 0;
nums.sort(function(a, b) {
    return a - b;
});for(var i = 0; i < nums.length - 1 && nums[i] <= 0; i++) {
    if(nums[i] === nums[i - 1]) continue; // continue means skip 
    var hash = {};
    for(var j = i + 1; j < nums.length; j++) {
        if(hash[target - nums[i] - nums[j]] === undefined){
            hash[nums[j]] = 1;
        }else{
          hash[target - nums[i] - nums[j]]++;
          if(hash[target - nums[i] - nums[j]] >  2){

          }else{
              solutions.push([nums[i], target - nums[i] - nums[j], nums[j]]);
          }
        }
    }
    console.log(hash);
}
return solutions;
 `);

  const files = ["index.js", "styles.css", "README.md"];
  const users = ["Ayan Alam", "Saboor", "Sameer","Ali","Saad"];
  const messages = [
    { user: "Ayan Alam", text: "I've updated the API endpoint." },
    { user: "Saboor", text: "Sure, I'll take a look now." },
    { user: "Sameer", text: "Finished working on bugfixes." },
    { user: "Saad", text: "Someone review the pull request." },
    { user: "Ali", text: "On it." },
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
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
          <ul>
            {files.map((file, index) => (
              <li key={index} className="py-1 px-2 rounded hover:bg-gray-700">
                {file}
              </li>
            ))}
          </ul>
        </aside>

        {/* Code Editor */}
        <main className="flex-1 flex flex-col">
          <Editor
            height="70vh"
            theme="vs-dark"
            defaultLanguage="javascript"
            defaultValue={code}
            onChange={(value) => setCode(value)}
          />
          <div className="bg-gray-800 text-green-400 p-4 h-24 overflow-auto border-t border-gray-700 font-mono">
            <p>$ Server started on port 3000</p>
            <p>&gt; GET / 200 OK - 0.5ms</p>
          </div>
        </main>

        {/* User List and Chat */}
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
    </div>
  );
};

export default CodingInterface;
