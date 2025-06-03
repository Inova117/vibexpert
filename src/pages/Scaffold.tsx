
import React, { useEffect, useState } from 'react';
import { Download, Github, ExternalLink, Folder, File, ChevronRight, ChevronDown } from 'lucide-react';

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
            children: [
              { name: 'ui', type: 'folder' },
              { name: 'Layout.tsx', type: 'file' },
              { name: 'Navbar.tsx', type: 'file' }
            ]
          },
          {
            name: 'pages',
            type: 'folder',
            children: [
              { name: 'Home.tsx', type: 'file' },
              { name: 'Dashboard.tsx', type: 'file' },
              { name: 'Profile.tsx', type: 'file' }
            ]
          },
          {
            name: 'hooks',
            type: 'folder',
            children: [
              { name: 'useAuth.ts', type: 'file' },
              { name: 'useApi.ts', type: 'file' }
            ]
          },
          {
            name: 'utils',
            type: 'folder',
            children: [
              { name: 'api.ts', type: 'file' },
              { name: 'constants.ts', type: 'file' }
            ]
          },
          { name: 'App.tsx', type: 'file' },
          { name: 'main.tsx', type: 'file' }
        ]
      },
      {
        name: 'api',
        type: 'folder',
        children: [
          { name: 'auth', type: 'folder' },
          { name: 'users', type: 'folder' },
          { name: 'middleware', type: 'folder' }
        ]
      },
      { name: 'package.json', type: 'file' },
      { name: 'tsconfig.json', type: 'file' },
      { name: 'tailwind.config.js', type: 'file' },
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

  const renderFileTree = (nodes: FileTreeNode[], path: number[] = []): React.ReactNode => {
    return nodes.map((node, index) => {
      const currentPath = [...path, index];
      const Icon = node.type === 'folder' ? 
        (node.expanded ? ChevronDown : ChevronRight) : File;
      
      return (
        <div key={node.name} className="select-none">
          <div 
            className={`flex items-center space-x-2 py-1 px-2 rounded hover:bg-white/5 cursor-pointer ${
              node.type === 'folder' ? 'font-medium' : 'text-gray-400'
            }`}
            onClick={() => node.type === 'folder' && toggleFolder(currentPath)}
          >
            {node.type === 'folder' ? (
              <Icon size={16} className="text-blue-400" />
            ) : (
              <File size={16} className="text-gray-500" />
            )}
            <Folder size={16} className={node.type === 'folder' ? 'text-blue-400' : 'hidden'} />
            <span className={node.type === 'folder' ? 'text-white' : 'text-gray-300'}>
              {node.name}
            </span>
          </div>
          {node.type === 'folder' && node.expanded && node.children && (
            <div className="ml-6 border-l border-white/10">
              {renderFileTree(node.children, currentPath)}
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
          <h1 className="text-4xl font-bold text-white">Project Scaffold Generated</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Your MVP blueprint is ready! Review the structure, wireframes, and export options below.
          </p>
        </div>

        {/* Project Summary */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Project Overview</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-blue-400 font-medium mb-2">App Idea</h3>
              <p className="text-gray-300 text-sm leading-relaxed">{projectData.appIdea}</p>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-green-400 font-medium">Frontend: </span>
                <span className="text-gray-300">{projectData.frontendStack || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-purple-400 font-medium">Backend: </span>
                <span className="text-gray-300">{projectData.backendStack || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-orange-400 font-medium">Auth: </span>
                <span className="text-gray-300">{projectData.authType || 'Not specified'}</span>
              </div>
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
            <div className="bg-black/20 rounded-lg p-4 font-mono text-sm max-h-96 overflow-y-auto">
              {renderFileTree(fileTree)}
            </div>
          </div>

          {/* Wireframe Preview */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Layout Wireframe</h2>
            <div className="bg-black/20 rounded-lg p-4 h-80">
              <div className="h-full border-2 border-dashed border-white/20 rounded-lg flex flex-col">
                {/* Header */}
                <div className="h-12 bg-white/10 rounded-t-lg flex items-center px-4">
                  <div className="w-8 h-8 bg-blue-400/30 rounded"></div>
                  <div className="ml-3 space-y-1">
                    <div className="w-20 h-2 bg-white/30 rounded"></div>
                    <div className="w-16 h-2 bg-white/20 rounded"></div>
                  </div>
                </div>
                
                <div className="flex-1 flex">
                  {/* Sidebar */}
                  <div className="w-16 bg-white/5 border-r border-white/10 p-2 space-y-2">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-8 h-8 bg-white/20 rounded"></div>
                    ))}
                  </div>
                  
                  {/* Main Content */}
                  <div className="flex-1 p-4 space-y-3">
                    <div className="w-3/4 h-4 bg-white/20 rounded"></div>
                    <div className="w-1/2 h-3 bg-white/15 rounded"></div>
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <div className="h-16 bg-white/10 rounded"></div>
                      <div className="h-16 bg-white/10 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-gray-400 text-sm mt-3">
              Responsive layout with sidebar navigation and dashboard cards
            </p>
          </div>
        </div>

        {/* Features Summary */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Features Included</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { label: 'Pages', value: '5 core pages', color: 'blue' },
              { label: 'Data Models', value: '3 main entities', color: 'green' },
              { label: 'Authentication', value: 'Secure auth flow', color: 'purple' },
              { label: 'Security', value: 'Best practices', color: 'orange' }
            ].map((feature, index) => (
              <div key={index} className="text-center p-4 bg-black/20 rounded-lg">
                <div className={`text-2xl font-bold text-${feature.color}-400 mb-1`}>
                  {feature.value}
                </div>
                <div className="text-gray-400 text-sm">{feature.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Export Options */}
        <div className="flex flex-wrap justify-center gap-4">
          <button className="flex items-center space-x-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg text-white transition-colors">
            <Github size={20} />
            <span>Export to GitHub</span>
          </button>
          
          <button className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white transition-colors">
            <Download size={20} />
            <span>Download ZIP</span>
          </button>
          
          <button className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg text-white transition-colors">
            <ExternalLink size={20} />
            <span>Continue in Lovable</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Scaffold;
