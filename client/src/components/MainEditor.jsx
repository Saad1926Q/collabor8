import React from 'react';
import PropTypes from 'prop-types';
import Editor from '@monaco-editor/react';

const MainEditor = ({ code, onChange, onMount }) => (
  <main className="flex-1 flex flex-col overflow-hidden">
    <Editor
      height="75vh"
      theme="vs-dark"
      defaultLanguage="javascript"
      value={code}
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

export default MainEditor;
