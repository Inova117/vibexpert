
import React, { useEffect, useState } from 'react';
import { Download, Github, ExternalLink, Folder, File, ChevronRight, ChevronDown, FolderOpen } from 'lucide-react';

interface ProjectData {
  appIdea: string;
  frontendStack: string;
  backendStack: string;
  authType: string;
  timestamp: number;
}

interface FileTreeNode {
  name: string;
  type: 'folder' | 'file';
  children?: FileTreeNode[];
  expanded?: boolean;
}

const Scaffold: React.FC = () => {
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [fileTree, setFileTree] = useState<FileTreeNode[]>([]);

  useEffect(() => {
    const data = localStorage.getItem('vibe-builder-data');
    if (data) {
      const parsed = JSON.parse(data) as ProjectData;
      setProjectData(parsed);
      generateFileTree(parsed);
    }
  }, []);

  const generateFileTree = (data: ProjectData): void => {
    const baseStructure: FileTreeNode[] = [
      {
        name: 'src',
        type: 'folder',
        expanded: true,
        children: [
          {
            name: 'components',
            type: 'folder',
            expanded: true,
            children: [
              { name: 'ui', type: 'folder', children: [
                { name: 'button.tsx', type: 'file' },
                { name: 'card.tsx', type: 'file' },
                { name: 'input.tsx', type: 'file' }
              ]},
              { name: 'Layout.tsx', type: 'file' },
              { name: 'Navbar.tsx', type: 'file' },
              { name: 'Sidebar.tsx', type: 'file' }
            ]
          },
          {
            name: 'pages',
            type: 'folder',
            expanded: true,
            children: [
              { name: 'Home.tsx', type: 'file' },
              { name: 'Dashboard.tsx', type: 'file' },
              { name: 'Profile.tsx', type: 'file' },
              { name: 'Settings.tsx', type: 'file' }
            ]
          },
          {
            name: 'hooks',
            type: 'folder',
            children: [
              { name: 'useAuth.ts', type: 'file' },
              { name: 'useApi.ts', type: 'file' },
              { name: 'useLocalStorage.ts', type: 'file' }
            ]
          },
          {
            name: 'utils',
            type: 'folder',
            children: [
              { name: 'api.ts', type: 'file' },
              { name: 'constants.ts', type: 'file' },
              { name: 'validation.ts', type: 'file' }
            ]
          },
          {
            name: 'types',
            type: 'folder',
            children: [
              { name: 'index.ts', type: 'file' },
              { name: 'auth.ts', type: 'file' }
            ]
          },
          { name: 'App.tsx', type: 'file' },
          { name: 'main.tsx', type: 'file' },
          { name: 'index.css', type: 'file' }
        ]
      },
      {
        name: 'supabase',
        type: 'folder',
        children: [
          { name: 'migrations', type: 'folder' },
          { name: 'functions', type: 'folder' },
          { name: 'config.toml', type: 'file' }
        ]
      },
      { name: 'package.json', type: 'file' },
      { name: 'tsconfig.json', type: 'file' },
      { name: 'tailwind.config.ts', type: 'file' },
      { name: 'vite.config.ts', type: 'file' },
      { name: '.env.example', type: 'file' },
      { name: 'README.md', type: 'file' }
    ];

    setFileTree(baseStructure);
  };

  const toggleFolder = (path: number[]) => {
    setFileTree(prev => {
      const newTree = [...prev];
      let current: any = newTree;
      
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]].children;
      }
      
      current[path[path.length - 1]].expanded = !current[path[path.length - 1]].expanded;
      return newTree;
    });
  };

  const renderFileTree = (nodes: FileTreeNode[], path: number[] = [], depth: number = 0): React.ReactNode => {
    return nodes.map((node, index) => {
      const currentPath = [...path, index];
      const isFolder = node.type === 'folder';
      const Icon = isFolder 
        ? (node.expanded ? FolderOpen : Folder)
        : File;
      
      return (
        <div key={node.name} className="select-none">
          <div 
            className={`flex items-center space-x-2 py-1.5 px-2 rounded hover:bg-white/5 cursor-pointer transition-colors ${
              isFolder ? 'font-medium text-white' : 'text-gray-300'
            }`}
            style={{ paddingLeft: `${depth * 20 + 8}px` }}
            onClick={() => isFolder && toggleFolder(currentPath)}
          >
            {isFolder && (
              <ChevronRight 
                size={14} 
                className={`text-gray-400 transition-transform ${node.expanded ? 'rotate-90' : ''}`} 
              />
            )}
            <Icon 
              size={16} 
              className={isFolder ? 'text-blue-400' : 'text-gray-500'} 
            />
            <span className="text-sm">{node.name}</span>
          </div>
          {isFolder && node.expanded && node.children && (
            <div>
              {renderFileTree(node.children, currentPath, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  if (!projectData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-lg">No project data found.</p>
          <p className="text-gray-500">Please go back to Home and generate a scaffold first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">MVP Scaffold Generated</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Your development blueprint is ready. Review the structure, wireframes, and deployment options.
          </p>
        </div>

        {/* Project Summary */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Generated Scaffold Summary</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-black/20 rounded-lg border border-blue-400/20">
              <div className="text-2xl font-bold text-blue-400 mb-1">5</div>
              <div className="text-gray-400 text-sm">Core Pages</div>
            </div>
            <div className="text-center p-4 bg-black/20 rounded-lg border border-green-400/20">
              <div className="text-2xl font-bold text-green-400 mb-1">3</div>
              <div className="text-gray-400 text-sm">Database Tables</div>
            </div>
            <div className="text-center p-4 bg-black/20 rounded-lg border border-purple-400/20">
              <div className="text-2xl font-bold text-purple-400 mb-1">ON</div>
              <div className="text-gray-400 text-sm">Authentication</div>
            </div>
            <div className="text-center p-4 bg-black/20 rounded-lg border border-orange-400/20">
              <div className="text-2xl font-bold text-orange-400 mb-1">ON</div>
              <div className="text-gray-400 text-sm">Security</div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* File Tree */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
              <Folder className="text-blue-400" size={20} />
              <span>Project Structure</span>
            </h2>
            <div className="bg-black/30 rounded-lg p-4 font-mono text-sm max-h-80 overflow-y-auto">
              {renderFileTree(fileTree)}
            </div>
          </div>

          {/* Wireframe Preview */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Wireframe Preview</h2>
            <div className="bg-black/30 rounded-lg p-4 h-80">
              <div className="h-full border-2 border-dashed border-white/20 rounded-lg flex flex-col">
                {/* Header */}
                <div className="h-12 bg-white/10 rounded-t-lg flex items-center px-4 border-b border-white/10">
                  <div className="w-6 h-6 bg-blue-400/30 rounded mr-3"></div>
                  <div className="text-xs text-white/60">App Header</div>
                </div>
                
                <div className="flex-1 flex">
                  {/* Sidebar */}
                  <div className="w-16 bg-white/5 border-r border-white/10 p-2 space-y-2">
                    <div className="text-xs text-white/40 mb-2">Nav</div>
                    {['Home', 'Dashboard', 'Profile', 'Settings'].map((item, i) => (
                      <div key={i} className="w-8 h-8 bg-white/20 rounded flex items-center justify-center">
                        <div className="w-3 h-3 bg-white/40 rounded"></div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Main Content */}
                  <div className="flex-1 p-4 space-y-3">
                    <div className="w-3/4 h-4 bg-white/20 rounded"></div>
                    <div className="w-1/2 h-3 bg-white/15 rounded"></div>
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <div className="h-16 bg-white/10 rounded flex items-center justify-center">
                        <span className="text-xs text-white/40">Dashboard Card</span>
                      </div>
                      <div className="h-16 bg-white/10 rounded flex items-center justify-center">
                        <span className="text-xs text-white/40">Analytics</span>
                      </div>
                    </div>
                    <div className="h-20 bg-white/10 rounded flex items-center justify-center">
                      <span className="text-xs text-white/40">Main Content Area</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-gray-400 text-sm mt-3">
              Responsive layout with navigation and modular components
            </p>
          </div>
        </div>

        {/* Stack Information */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Technology Stack</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-blue-400 font-medium mb-2">Frontend</h3>
              <p className="text-gray-300 text-sm">{projectData.frontendStack || 'React + TypeScript + Tailwind'}</p>
            </div>
            <div>
              <h3 className="text-purple-400 font-medium mb-2">Backend</h3>
              <p className="text-gray-300 text-sm">{projectData.backendStack || 'Supabase + Edge Functions'}</p>
            </div>
            <div>
              <h3 className="text-orange-400 font-medium mb-2">Authentication</h3>
              <p className="text-gray-300 text-sm">{projectData.authType || 'Email + Password'}</p>
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div className="text-center space-y-6">
          <h2 className="text-2xl font-semibold text-white">Deploy Your MVP</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="flex items-center space-x-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg text-white transition-colors">
              <Github size={20} />
              <span>Export to GitHub</span>
            </button>
            
            <button className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white transition-colors">
              <Download size={20} />
              <span>Download as ZIP</span>
            </button>
            
            <button className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg text-white transition-colors">
              <ExternalLink size={20} />
              <span>Continue in Lovable</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scaffold;
