
import React, { useState } from 'react';
import { Search, Copy, Filter, Code, Database, Shield, TestTube, Layout, CheckCircle } from 'lucide-react';

interface Prompt {
  id: string;
  title: string;
  description: string;
  content: string;
  category: 'frontend' | 'backend' | 'auth' | 'security' | 'testing' | 'ui';
  tool: 'lovable' | 'cursor' | 'both';
}

const prompts: Prompt[] = [
  {
    id: '1',
    title: 'Generate New Page',
    description: 'Create a new page with routing and basic layout',
    content: 'Create a new page called [PAGE_NAME] with:\n- Route setup in App.tsx\n- Basic layout with header and content area\n- Navigation link in sidebar\n- Responsive design using Tailwind CSS\n- TypeScript interfaces for props',
    category: 'frontend',
    tool: 'both'
  },
  {
    id: '2',
    title: 'Add Authentication',
    description: 'Implement user authentication with Supabase',
    content: 'Add authentication to this app using Supabase:\n- Set up auth context and provider\n- Create login/signup forms with validation\n- Add protected routes\n- Implement logout functionality\n- Add user session management\n- Include proper TypeScript types',
    category: 'auth',
    tool: 'lovable'
  },
  {
    id: '3',
    title: 'Implement Row-Level Security',
    description: 'Set up RLS policies for data protection',
    content: 'Implement Row-Level Security for the [TABLE_NAME] table:\n- Enable RLS on the table\n- Create policies for SELECT, INSERT, UPDATE, DELETE\n- Ensure users can only access their own data\n- Add proper error handling\n- Include SQL migration scripts',
    category: 'security',
    tool: 'both'
  },
  {
    id: '4',
    title: 'Create API Endpoint',
    description: 'Build a new API endpoint with validation',
    content: 'Create a new API endpoint for [FUNCTIONALITY]:\n- Set up route handler with proper HTTP methods\n- Add input validation using Zod\n- Implement error handling and status codes\n- Add authentication middleware if needed\n- Include TypeScript types for request/response',
    category: 'backend',
    tool: 'cursor'
  },
  {
    id: '5',
    title: 'Refactor Components',
    description: 'Break down large components into smaller ones',
    content: 'Refactor the [COMPONENT_NAME] component:\n- Identify reusable logic and UI parts\n- Extract into smaller, focused components\n- Maintain existing functionality exactly\n- Add proper prop interfaces\n- Update imports and exports\n- Keep the same file structure',
    category: 'frontend',
    tool: 'both'
  },
  {
    id: '6',
    title: 'Add Unit Tests',
    description: 'Create comprehensive unit tests for components',
    content: 'Add unit tests for [COMPONENT/FUNCTION]:\n- Test all major functionality and edge cases\n- Mock external dependencies\n- Test error states and loading states\n- Use Jest and React Testing Library\n- Achieve 80%+ test coverage\n- Add test utilities for common patterns',
    category: 'testing',
    tool: 'cursor'
  },
  {
    id: '7',
    title: 'Database Schema Design',
    description: 'Design normalized database schema',
    content: 'Design a database schema for [FEATURE]:\n- Create normalized tables with proper relationships\n- Add appropriate indexes for performance\n- Include created_at and updated_at timestamps\n- Set up foreign key constraints\n- Add RLS policies for security\n- Include SQL migration scripts',
    category: 'backend',
    tool: 'both'
  },
  {
    id: '8',
    title: 'Responsive Dashboard',
    description: 'Create a responsive dashboard layout',
    content: 'Create a responsive dashboard with:\n- Grid layout that adapts to screen sizes\n- Card-based component structure\n- Mobile-first responsive design\n- Loading states and error handling\n- Charts and data visualization\n- Dark mode support\n- Clean, modern UI with glassmorphism',
    category: 'ui',
    tool: 'lovable'
  }
];

const PromptLibrary: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = [
    { value: 'all', label: 'All Categories', icon: Filter },
    { value: 'frontend', label: 'Frontend', icon: Layout },
    { value: 'backend', label: 'Backend', icon: Database },
    { value: 'auth', label: 'Authentication', icon: Shield },
    { value: 'security', label: 'Security', icon: Shield },
    { value: 'testing', label: 'Testing', icon: TestTube },
    { value: 'ui', label: 'UI/UX', icon: Layout },
  ];

  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || prompt.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const copyToClipboard = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      frontend: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
      backend: 'text-green-400 bg-green-400/10 border-green-400/20',
      auth: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
      security: 'text-red-400 bg-red-400/10 border-red-400/20',
      testing: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
      ui: 'text-pink-400 bg-pink-400/10 border-pink-400/20',
    };
    return colors[category as keyof typeof colors] || 'text-gray-400 bg-gray-400/10 border-gray-400/20';
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">Prompt Library</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Ready-to-use prompts for Lovable and Cursor. Copy, customize, and accelerate your development workflow.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search prompts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-black/20 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 bg-black/20 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value} className="bg-gray-800">
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Prompt Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrompts.map((prompt) => (
            <div
              key={prompt.id}
              className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-white">{prompt.title}</h3>
                    <p className="text-gray-400 text-sm">{prompt.description}</p>
                  </div>
                  <div className="flex space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-lg border ${getCategoryColor(prompt.category)}`}>
                      {prompt.category}
                    </span>
                  </div>
                </div>
                
                <div className="bg-black/30 rounded-lg p-3 text-sm text-gray-300 font-mono max-h-32 overflow-y-auto">
                  {prompt.content.substring(0, 150)}...
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Code size={14} className="text-gray-500" />
                    <span className="text-xs text-gray-500 capitalize">{prompt.tool}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(prompt.content, prompt.id)}
                    className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm transition-colors"
                  >
                    {copiedId === prompt.id ? (
                      <>
                        <CheckCircle size={16} />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredPrompts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No prompts found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptLibrary;
