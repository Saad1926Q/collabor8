export const renderFileStructure = (files, handleFileClick, expandedFolders, toggleFolder, path = "", level = 0) => {
    if (!files || !Array.isArray(files)) {
      return <div className="text-gray-400 italic text-sm">No files available</div>;
    }
  
    return (
      <ul className="file-tree">
        {files.map((file, index) => {
          const filePath = path ? `${path}/${file.name}` : file.name;
          const isExpanded = expandedFolders[filePath] !== false;
  
          return (
            <li key={index} className={`py-1 px-1 rounded ${file.type === 'file' ? 'hover:bg-gray-700' : ''}`}>
              <div 
                className={`flex items-center cursor-pointer ${file.type === 'file' ? 'pl-4' : ''}`}
                onClick={() => file.type === 'folder' ? toggleFolder(filePath) : handleFileClick(file.path)}
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
  
  export const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    const iconMap = {
      js: '📄 JS', jsx: '📄 JSX', ts: '📄 TS', tsx: '📄 TSX',
      html: '📄 HTML', css: '📄 CSS', json: '📄 JSON',
      md: '📄 MD', py: '📄 PY', java: '📄 JAVA',
      c: '📄 C', cpp: '📄 C++', go: '📄 GO', rb: '📄 RB',
      php: '📄 PHP', sql: '📄 SQL',
    };
    return iconMap[ext] || '📄';
  };
  