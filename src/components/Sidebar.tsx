
import React from 'react';
import { Home, Code, BookOpen, Settings, ChevronLeft, ChevronRight, Terminal, GitBranch } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, toggleSidebar }) => {
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Code, label: 'Scaffold', path: '/scaffold' },
    { icon: BookOpen, label: 'Best Practices', path: '/best-practices' },
    { icon: Terminal, label: 'Prompt Library', path: '/prompt-library' },
    { icon: GitBranch, label: 'Export & Integration', path: '/export-integration' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className={`fixed left-0 top-0 h-full bg-black/20 backdrop-blur-xl border-r border-white/10 transition-all duration-300 z-40 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Vibe-Builder
              </h1>
            )}
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 group ${
                      isActive 
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-400/30' 
                        : 'hover:bg-white/10 text-gray-300 hover:text-white'
                    }`}
                  >
                    <Icon size={20} className={isActive ? 'text-blue-400' : 'text-gray-400 group-hover:text-white'} />
                    {!isCollapsed && (
                      <span className="font-medium">{item.label}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          {!isCollapsed && (
            <div className="text-xs text-gray-400 text-center">
              v1.0.0 • Made for developers
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
