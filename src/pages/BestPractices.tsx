
import React, { useState } from 'react';
import { Shield, Code, Zap, Copy, Check, CheckCircle, XCircle, ArrowRight, Lightbulb } from 'lucide-react';

const BestPractices: React.FC = () => {
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(id);
    setTimeout(() => setCopiedPrompt(null), 2000);
  };

  const dosAndDonts = [
    {
      category: 'Database & Security',
      dos: [
        'Enable Row Level Security (RLS) on all tables',
        'Use environment variables for all secrets',
        'Implement proper database migrations',
        'Add indexes for frequently queried columns',
        'Use prepared statements to prevent SQL injection'
      ],
      donts: [
        'Never commit API keys or secrets to version control',
        'Don\'t disable RLS without explicit security review',
        'Don\'t store passwords in plain text',
        'Don\'t trust client-side validation alone',
        'Don\'t give users direct database access'
      ]
    },
    {
      category: 'Development Workflow',
      dos: [
        'Set up CI/CD pipeline from day one',
        'Write tests for critical business logic',
        'Use TypeScript for better code quality',
        'Implement proper error boundaries',
        'Deploy to staging before production'
      ],
      donts: [
        'Don\'t push directly to main branch',
        'Don\'t skip code reviews for critical features',
        'Don\'t ignore TypeScript errors',
        'Don\'t deploy without testing',
        'Don\'t mix frontend and backend concerns'
      ]
    }
  ];

  const buildRoadmap = [
    {
      step: 1,
      title: 'Define & Validate',
      description: 'Clarify your MVP scope and validate core assumptions',
      tasks: ['Write user stories', 'Define API contracts', 'Create data models', 'Validate with potential users']
    },
    {
      step: 2,
      title: 'Setup Foundation',
      description: 'Establish your development environment and architecture',
      tasks: ['Initialize project with Vite + React', 'Connect Supabase', 'Setup authentication', 'Configure CI/CD']
    },
    {
      step: 3,
      title: 'Build Core Features',
      description: 'Develop the essential functionality for your MVP',
      tasks: ['Create database schema', 'Build API endpoints', 'Implement auth flows', 'Create core UI components']
    },
    {
      step: 4,
      title: 'Polish & Secure',
      description: 'Prepare your application for production deployment',
      tasks: ['Add error handling', 'Implement security measures', 'Optimize performance', 'Add monitoring']
    },
    {
      step: 5,
      title: 'Deploy & Monitor',
      description: 'Launch your MVP and gather real user feedback',
      tasks: ['Deploy to production', 'Setup analytics', 'Monitor performance', 'Collect user feedback']
    },
    {
      step: 6,
      title: 'Iterate & Scale',
      description: 'Use data-driven insights to improve and grow',
      tasks: ['Analyze user behavior', 'A/B test features', 'Plan monetization', 'Scale infrastructure']
    }
  ];

  const promptLibrary = [
    {
      id: 'new-page',
      title: 'Add New Page',
      category: 'Frontend',
      prompt: `Create a new page component with the following requirements:
- Page name: [PAGE_NAME]
- Purpose: [DESCRIBE_PURPOSE]
- Include proper TypeScript interfaces
- Use Tailwind CSS for styling
- Add responsive design
- Include loading and error states
- Add the route to the router configuration`
    },
    {
      id: 'secure-endpoint',
      title: 'Secure API Endpoint',
      category: 'Backend',
      prompt: `Create a secure API endpoint with these specifications:
- Endpoint: [METHOD] /api/[ROUTE]
- Purpose: [DESCRIBE_PURPOSE]
- Implement JWT authentication
- Add request validation using Zod
- Include proper error handling
- Add rate limiting
- Use Supabase RLS policies
- Return consistent JSON responses`
    },
    {
      id: 'database-table',
      title: 'Database Table with RLS',
      category: 'Database',
      prompt: `Create a new database table with Row Level Security:
- Table name: [TABLE_NAME]
- Purpose: [DESCRIBE_PURPOSE]
- Include proper foreign key relationships
- Add RLS policies for CRUD operations
- Create appropriate indexes
- Include audit fields (created_at, updated_at)
- Write migration file`
    },
    {
      id: 'auth-flow',
      title: 'Authentication Flow',
      category: 'Auth',
      prompt: `Implement authentication flow with:
- Auth type: [EMAIL/OAUTH/MAGIC_LINK]
- Include login, signup, and logout
- Add protected route wrapper
- Implement session management
- Create auth context/hooks
- Add proper error handling
- Include email verification if needed`
    },
    {
      id: 'ui-component',
      title: 'Reusable UI Component',
      category: 'Frontend',
      prompt: `Create a reusable UI component with:
- Component name: [COMPONENT_NAME]
- Purpose: [DESCRIBE_PURPOSE]
- Use proper TypeScript props interface
- Include all necessary variants/states
- Add accessibility attributes
- Use Tailwind CSS for styling
- Include hover and focus states
- Make it responsive`
    },
    {
      id: 'error-handling',
      title: 'Error Boundary & Handling',
      category: 'Quality',
      prompt: `Implement comprehensive error handling:
- Create React error boundary component
- Add global error handler for async operations
- Implement user-friendly error messages
- Add error reporting/logging
- Include retry mechanisms where appropriate
- Handle network errors gracefully`
    }
  ];

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">Development Best Practices</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Proven strategies, workflows, and prompts to ship your MVP faster and more securely.
          </p>
        </div>

        {/* Top Dos & Don'ts */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <h2 className="text-2xl font-semibold text-white mb-6 flex items-center space-x-2">
            <Shield className="text-red-400" size={24} />
            <span>Essential Dos & Don'ts</span>
          </h2>
          
          <div className="grid lg:grid-cols-1 gap-6">
            {dosAndDonts.map((section, index) => (
              <div key={index} className="bg-black/20 rounded-lg p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">{section.category}</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Dos */}
                  <div>
                    <h4 className="text-green-400 font-medium mb-3 flex items-center space-x-2">
                      <CheckCircle size={16} />
                      <span>Essential Dos</span>
                    </h4>
                    <ul className="space-y-2">
                      {section.dos.map((item, i) => (
                        <li key={i} className="text-gray-300 text-sm flex items-start space-x-2">
                          <Check size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Don'ts */}
                  <div>
                    <h4 className="text-red-400 font-medium mb-3 flex items-center space-x-2">
                      <XCircle size={16} />
                      <span>Critical Don'ts</span>
                    </h4>
                    <ul className="space-y-2">
                      {section.donts.map((item, i) => (
                        <li key={i} className="text-gray-300 text-sm flex items-start space-x-2">
                          <XCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Build Roadmap */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <h2 className="text-2xl font-semibold text-white mb-6 flex items-center space-x-2">
            <Code className="text-blue-400" size={24} />
            <span>MVP Build Roadmap</span>
          </h2>
          
          <div className="space-y-4">
            {buildRoadmap.map((phase, index) => (
              <div key={index} className="bg-black/20 rounded-lg p-6 border border-white/10">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {phase.step}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">{phase.title}</h3>
                    <p className="text-gray-400 text-sm mb-3">{phase.description}</p>
                    <div className="grid md:grid-cols-2 gap-2">
                      {phase.tasks.map((task, i) => (
                        <div key={i} className="flex items-center space-x-2 text-gray-300 text-sm">
                          <ArrowRight size={12} className="text-blue-400" />
                          <span>{task}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prompt Library */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <h2 className="text-2xl font-semibold text-white mb-6 flex items-center space-x-2">
            <Lightbulb className="text-yellow-400" size={24} />
            <span>Copy-Paste Prompt Library</span>
          </h2>
          <p className="text-gray-400 mb-6">
            Battle-tested prompts for Lovable and Cursor. Click to copy and customize with your specific requirements.
          </p>
          
          <div className="grid gap-4">
            {promptLibrary.map((prompt) => (
              <div key={prompt.id} className="bg-black/20 rounded-lg p-6 border border-white/10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{prompt.title}</h3>
                    <span className="text-sm text-blue-400">{prompt.category}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(prompt.prompt, prompt.id)}
                    className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm transition-colors"
                  >
                    {copiedPrompt === prompt.id ? <Check size={16} /> : <Copy size={16} />}
                    <span>{copiedPrompt === prompt.id ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                
                <pre className="text-gray-300 text-sm whitespace-pre-wrap bg-black/30 rounded p-4 overflow-x-auto">
                  {prompt.prompt}
                </pre>
              </div>
            ))}
          </div>
        </div>

        {/* Money-Saving Tips */}
        <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 backdrop-blur-xl rounded-2xl border border-green-400/20 p-6">
          <h2 className="text-2xl font-semibold text-white mb-4 flex items-center space-x-2">
            <Zap className="text-yellow-400" size={24} />
            <span>Save Time & Money</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-green-400 font-medium mb-3">Efficient AI Prompting</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li className="flex items-start space-x-2">
                  <Check size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Use specific, detailed prompts to reduce iterations</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Break complex features into smaller, focused requests</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Provide context about your existing codebase</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Use the prompt library above for consistent results</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-blue-400 font-medium mb-3">MVP Development Strategy</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li className="flex items-start space-x-2">
                  <Check size={14} className="text-blue-400 mt-0.5 flex-shrink-0" />
                  <span>Start with MVP features only - avoid feature creep</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check size={14} className="text-blue-400 mt-0.5 flex-shrink-0" />
                  <span>Use proven tech stacks to avoid debugging</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check size={14} className="text-blue-400 mt-0.5 flex-shrink-0" />
                  <span>Implement proper error handling from the start</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check size={14} className="text-blue-400 mt-0.5 flex-shrink-0" />
                  <span>Use existing libraries instead of building from scratch</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BestPractices;
