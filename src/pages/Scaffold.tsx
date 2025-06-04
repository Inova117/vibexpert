import React, { useEffect, useState } from 'react';
import { Download, Github, ExternalLink, Folder, File, ChevronRight, ChevronDown, FolderOpen, ArrowLeft, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProjectData {
  appIdea: string;
  frontendStack: string;
  backendStack: string;
  authType: string;
  features?: string[];
  timestamp: number;
  file_structure?: any;
  id?: string;
  status?: string;
}

interface FileTreeNode {
  name: string;
  type: 'file' | 'folder';
  children?: FileTreeNode[];
  expanded?: boolean;
  description?: string;
}

const Scaffold: React.FC = () => {
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [fileTree, setFileTree] = useState<FileTreeNode[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const data = localStorage.getItem('vibe-builder-data');
    if (data) {
      const parsed = JSON.parse(data) as ProjectData;
      setProjectData(parsed);
      generateFileTree(parsed);
    } else {
      // No data, redirect to home
      navigate('/');
    }
  }, [navigate]);

  const generateFileTree = (data: ProjectData): void => {
    const getStackFiles = (frontend: string, backend: string) => {
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
                { 
                  name: 'ui', 
                  type: 'folder', 
                  children: [
                    { name: 'button.tsx', type: 'file' as const, description: 'Reusable button component with variants' },
                    { name: 'card.tsx', type: 'file' as const, description: 'Card container component' },
                    { name: 'input.tsx', type: 'file' as const, description: 'Form input with validation' },
                    { name: 'modal.tsx', type: 'file' as const, description: 'Modal dialog component' },
                    { name: 'navbar.tsx', type: 'file' as const, description: 'Navigation bar component' }
                  ]
                },
                { name: 'Layout.tsx', type: 'file' as const, description: 'Main app layout wrapper' },
                { name: 'ErrorBoundary.tsx', type: 'file' as const, description: 'Error boundary for React errors' },
                { name: 'LoadingSpinner.tsx', type: 'file' as const, description: 'Loading state component' }
              ]
            },
            {
              name: 'pages',
              type: 'folder',
              expanded: true,
              children: [
                { name: 'Home.tsx', type: 'file' as const, description: 'Landing page component' },
                { name: 'Dashboard.tsx', type: 'file' as const, description: 'Main dashboard page' },
                { name: 'Profile.tsx', type: 'file' as const, description: 'User profile page' },
                { name: 'Settings.tsx', type: 'file' as const, description: 'App settings page' },
                ...(data.features?.includes('auth') ? [
                  { name: 'Login.tsx', type: 'file' as const, description: 'Login page component' },
                  { name: 'Register.tsx', type: 'file' as const, description: 'Registration page' }
                ] : [])
              ]
            },
            {
              name: 'hooks',
              type: 'folder',
              children: [
                { name: 'useAuth.ts', type: 'file' as const, description: 'Authentication hook' },
                { name: 'useApi.ts', type: 'file' as const, description: 'API interaction hooks' },
                { name: 'useLocalStorage.ts', type: 'file' as const, description: 'Local storage hook' },
                ...(data.features?.includes('realtime') ? [
                  { name: 'useWebSocket.ts', type: 'file' as const, description: 'WebSocket connection hook' }
                ] : [])
              ]
            },
            {
              name: 'lib',
              type: 'folder',
              children: [
                { name: 'utils.ts', type: 'file' as const, description: 'Utility functions' },
                { name: 'constants.ts', type: 'file' as const, description: 'App constants' },
                { name: 'validation.ts', type: 'file' as const, description: 'Zod validation schemas' },
                ...(backend.includes('supabase') ? [
                  { name: 'supabase.ts', type: 'file' as const, description: 'Supabase client configuration' }
                ] : []),
                ...(data.features?.includes('payments') ? [
                  { name: 'stripe.ts', type: 'file' as const, description: 'Stripe payment integration' }
                ] : [])
              ]
            },
            {
              name: 'types',
              type: 'folder',
              children: [
                { name: 'index.ts', type: 'file' as const, description: 'Global type definitions' },
                { name: 'auth.ts', type: 'file' as const, description: 'Authentication types' },
                { name: 'api.ts', type: 'file' as const, description: 'API response types' },
                ...(backend.includes('supabase') ? [
                  { name: 'database.ts', type: 'file' as const, description: 'Database types from Supabase' }
                ] : [])
              ]
            },
            { name: 'App.tsx', type: 'file' as const, description: 'Main App component' },
            { name: 'main.tsx', type: 'file' as const, description: 'App entry point' },
            { name: 'index.css', type: 'file' as const, description: 'Global styles with Tailwind' }
          ]
        },
        {
          name: 'supabase',
          type: 'folder',
          children: [
            { 
              name: 'migrations', 
              type: 'folder',
              children: [
                { name: '20241201000001_initial_schema.sql', type: 'file' as const, description: 'Initial database schema' },
                ...(data.features?.includes('auth') ? [
                  { name: '20241201000002_auth_tables.sql', type: 'file' as const, description: 'User authentication tables' }
                ] : [])
              ]
            },
            { 
              name: 'functions', 
              type: 'folder',
              children: [
                { name: 'auth-handler', type: 'folder' as const },
                { name: 'api-endpoints', type: 'folder' as const },
                ...(data.features?.includes('payments') ? [
                  { name: 'stripe-webhook', type: 'folder' as const }
                ] : [])
              ]
            },
            { name: 'config.toml', type: 'file' as const, description: 'Supabase configuration' }
          ]
        },
        ...(data.features?.includes('mobile') ? [{
          name: 'mobile',
          type: 'folder' as const,
          children: [
            { name: 'App.tsx', type: 'file' as const, description: 'React Native app component' },
            { name: 'metro.config.js', type: 'file' as const, description: 'Metro bundler configuration' }
          ]
        }] : []),
        { name: 'package.json', type: 'file' as const, description: 'Project dependencies and scripts' },
        { name: 'tsconfig.json', type: 'file' as const, description: 'TypeScript configuration' },
        { name: 'tailwind.config.ts', type: 'file' as const, description: 'Tailwind CSS configuration' },
        { name: 'vite.config.ts', type: 'file' as const, description: 'Vite build tool configuration' },
        { name: '.env.example', type: 'file' as const, description: 'Environment variables template' },
        { name: '.eslintrc.json', type: 'file' as const, description: 'ESLint configuration' },
        { name: '.prettierrc', type: 'file' as const, description: 'Prettier formatting rules' },
        { name: 'README.md', type: 'file' as const, description: 'Project documentation' },
        { name: 'DEPLOYMENT.md', type: 'file' as const, description: 'Deployment instructions' }
      ];

      return baseStructure;
    };

    const structure = getStackFiles(data.frontendStack, data.backendStack);
    setFileTree(structure);
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
            className={`flex items-center space-x-2 py-1.5 px-2 rounded hover:bg-white/5 cursor-pointer transition-colors group ${
              isFolder ? 'font-medium text-white' : 'text-gray-300'
            }`}
            style={{ paddingLeft: `${depth * 20 + 8}px` }}
            onClick={() => isFolder && toggleFolder(currentPath)}
            title={node.description}
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
            <span className="text-sm flex-1">{node.name}</span>
            {node.description && (
              <span className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity max-w-xs truncate">
                {node.description}
              </span>
            )}
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

  const getFeatureCount = (features: string[] = []) => {
    return features.length + 5; // Base features + selected features
  };

  const getFileCount = (nodes: FileTreeNode[]): number => {
    return nodes.reduce((count, node) => {
      if (node.type === 'file') {
        return count + 1;
      } else if (node.children) {
        return count + getFileCount(node.children);
      }
      return count;
    }, 0);
  };

  if (!projectData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-gray-400 text-lg">No project data found.</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-medium transition-colors"
          >
            Go Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
            <div>
              <h1 className="text-4xl font-bold text-white">MVP Scaffold Generated</h1>
              <p className="text-gray-400">Your development blueprint is ready to use</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <span className="text-green-400 font-medium">Generation Complete</span>
          </div>
        </div>

        {/* Project Summary */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Generated Scaffold Summary</h2>
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-black/20 rounded-lg border border-blue-400/20">
              <div className="text-2xl font-bold text-blue-400 mb-1">{getFileCount(fileTree)}</div>
              <div className="text-gray-400 text-sm">Files Generated</div>
            </div>
            <div className="text-center p-4 bg-black/20 rounded-lg border border-green-400/20">
              <div className="text-2xl font-bold text-green-400 mb-1">{getFeatureCount(projectData.features)}</div>
              <div className="text-gray-400 text-sm">Features Included</div>
            </div>
            <div className="text-center p-4 bg-black/20 rounded-lg border border-purple-400/20">
              <div className="text-2xl font-bold text-purple-400 mb-1">ON</div>
              <div className="text-gray-400 text-sm">Authentication</div>
            </div>
            <div className="text-center p-4 bg-black/20 rounded-lg border border-orange-400/20">
              <div className="text-2xl font-bold text-orange-400 mb-1">✓</div>
              <div className="text-gray-400 text-sm">Security Ready</div>
            </div>
          </div>

          {/* App Idea */}
          <div className="bg-black/20 rounded-lg p-4">
            <h3 className="text-white font-medium mb-2">Your App Idea</h3>
            <p className="text-gray-300 leading-relaxed">{projectData.appIdea}</p>
          </div>
        </div>

        {/* File Tree */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
            <Folder className="text-blue-400" size={20} />
            <span>Project Structure</span>
          </h2>
          <div className="bg-black/30 rounded-lg p-4 font-mono text-sm max-h-96 overflow-y-auto">
            {renderFileTree(fileTree)}
          </div>
        </div>

        {/* Technology Stack */}
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
          
          {projectData.features && projectData.features.length > 0 && (
            <div className="mt-6">
              <h3 className="text-green-400 font-medium mb-3">Additional Features</h3>
              <div className="flex flex-wrap gap-2">
                {projectData.features.map((feature, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-500/20 border border-green-400/30 rounded-full text-green-300 text-sm"
                  >
                    {feature.charAt(0).toUpperCase() + feature.slice(1)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Export Options */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Export & Deploy</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/export-integration')}
              className="p-4 bg-black/20 hover:bg-black/30 border border-white/20 rounded-lg transition-colors group"
            >
              <Download className="w-8 h-8 text-blue-400 mb-3" />
              <h3 className="text-white font-medium mb-1">Download ZIP</h3>
              <p className="text-gray-400 text-sm">Get complete project files</p>
            </button>
            
            <button
              onClick={() => navigate('/export-integration')}
              className="p-4 bg-black/20 hover:bg-black/30 border border-white/20 rounded-lg transition-colors group"
            >
              <Github className="w-8 h-8 text-purple-400 mb-3" />
              <h3 className="text-white font-medium mb-1">Push to GitHub</h3>
              <p className="text-gray-400 text-sm">Create repository automatically</p>
            </button>
            
            <button
              onClick={() => navigate('/export-integration')}
              className="p-4 bg-black/20 hover:bg-black/30 border border-white/20 rounded-lg transition-colors group"
            >
              <ExternalLink className="w-8 h-8 text-green-400 mb-3" />
              <h3 className="text-white font-medium mb-1">Deploy Now</h3>
              <p className="text-gray-400 text-sm">One-click deployment</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scaffold;
