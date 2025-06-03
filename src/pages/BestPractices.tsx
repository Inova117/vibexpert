
import React, { useState } from 'react';
import { Shield, Code, Zap, Copy, Check } from 'lucide-react';

const BestPractices: React.FC = () => {
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(id);
    setTimeout(() => setCopiedPrompt(null), 2000);
  };

  const optimizedPrompts = [
    {
      id: 'component',
      title: 'Create React Component',
      prompt: `Create a reusable React component with TypeScript that:
- Uses proper TypeScript interfaces for props
- Includes error boundaries
- Follows accessibility best practices
- Has proper prop validation
- Uses Tailwind CSS for styling
- Includes hover states and transitions

Component name: [COMPONENT_NAME]
Purpose: [DESCRIBE_PURPOSE]`,
      category: 'Frontend'
    },
    {
      id: 'api',
      title: 'Build API Endpoint',
      prompt: `Create a secure API endpoint that:
- Uses proper HTTP status codes
- Implements request validation
- Includes error handling
- Has rate limiting
- Uses JWT authentication
- Returns consistent JSON structure
- Includes logging

Endpoint: [METHOD] /api/[ROUTE]
Purpose: [DESCRIBE_PURPOSE]`,
      category: 'Backend'
    },
    {
      id: 'database',
      title: 'Design Database Schema',
      prompt: `Design a database schema that:
- Uses proper normalization
- Includes foreign key constraints
- Has appropriate indexes
- Implements soft deletes
- Includes audit fields (created_at, updated_at)
- Uses proper data types
- Considers performance implications

Tables needed: [LIST_TABLES]
Relationships: [DESCRIBE_RELATIONSHIPS]`,
      category: 'Database'
    }
  ];

  const securityRules = [
    {
      category: 'Environment & Keys',
      dos: [
        'Use environment variables for all sensitive data',
        'Rotate API keys regularly',
        'Use different keys for different environments',
        'Implement key rotation strategies'
      ],
      donts: [
        'Never commit API keys to version control',
        'Don\'t hardcode secrets in your code',
        'Don\'t share production keys in Slack/email',
        'Don\'t use the same key across multiple projects'
      ]
    },
    {
      category: 'Authentication & Authorization',
      dos: [
        'Implement proper JWT token expiration',
        'Use HTTPS for all authentication endpoints',
        'Implement rate limiting on auth routes',
        'Use secure password hashing (bcrypt, scrypt)'
      ],
      donts: [
        'Don\'t store passwords in plain text',
        'Don\'t use predictable session IDs',
        'Don\'t trust client-side validation alone',
        'Don\'t implement your own crypto'
      ]
    },
    {
      category: 'Database Security',
      dos: [
        'Use parameterized queries to prevent SQL injection',
        'Implement proper access controls',
        'Encrypt sensitive data at rest',
        'Backup your database regularly'
      ],
      donts: [
        'Don\'t use string concatenation for SQL queries',
        'Don\'t give users direct database access',
        'Don\'t store credit card data without PCI compliance',
        'Don\'t forget to sanitize user inputs'
      ]
    }
  ];

  const developmentGuidelines = [
    {
      title: 'Code Organization',
      points: [
        'Use feature-based folder structure',
        'Keep components small and focused',
        'Implement proper error boundaries',
        'Use TypeScript for better type safety',
        'Write meaningful commit messages'
      ]
    },
    {
      title: 'Performance',
      points: [
        'Implement lazy loading for routes',
        'Optimize images and assets',
        'Use React.memo for expensive components',
        'Implement proper caching strategies',
        'Monitor bundle size regularly'
      ]
    },
    {
      title: 'Testing',
      points: [
        'Write unit tests for business logic',
        'Implement integration tests for APIs',
        'Use end-to-end tests for critical flows',
        'Aim for 80%+ code coverage',
        'Test error scenarios'
      ]
    }
  ];

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">Development Best Practices</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Optimized prompts, security guidelines, and development practices to build better MVPs faster.
          </p>
        </div>

        {/* Optimized Prompts */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <h2 className="text-2xl font-semibold text-white mb-6 flex items-center space-x-2">
            <Zap className="text-yellow-400" size={24} />
            <span>AI-Optimized Prompts</span>
          </h2>
          
          <div className="grid gap-6">
            {optimizedPrompts.map((prompt) => (
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

        {/* Security Guidelines */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <h2 className="text-2xl font-semibold text-white mb-6 flex items-center space-x-2">
            <Shield className="text-red-400" size={24} />
            <span>Security Guidelines</span>
          </h2>
          
          <div className="grid lg:grid-cols-1 gap-6">
            {securityRules.map((section, index) => (
              <div key={index} className="bg-black/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">{section.category}</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Dos */}
                  <div>
                    <h4 className="text-green-400 font-medium mb-3 flex items-center space-x-2">
                      <Check size={16} />
                      <span>Do's</span>
                    </h4>
                    <ul className="space-y-2">
                      {section.dos.map((item, i) => (
                        <li key={i} className="text-gray-300 text-sm flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Don'ts */}
                  <div>
                    <h4 className="text-red-400 font-medium mb-3 flex items-center space-x-2">
                      <span className="text-lg">×</span>
                      <span>Don'ts</span>
                    </h4>
                    <ul className="space-y-2">
                      {section.donts.map((item, i) => (
                        <li key={i} className="text-gray-300 text-sm flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
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

        {/* Development Guidelines */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <h2 className="text-2xl font-semibold text-white mb-6 flex items-center space-x-2">
            <Code className="text-blue-400" size={24} />
            <span>Development Guidelines</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {developmentGuidelines.map((guideline, index) => (
              <div key={index} className="bg-black/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">{guideline.title}</h3>
                <ul className="space-y-3">
                  {guideline.points.map((point, i) => (
                    <li key={i} className="text-gray-300 text-sm flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Money-Saving Tips */}
        <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 backdrop-blur-xl rounded-2xl border border-green-400/20 p-6">
          <h2 className="text-2xl font-semibold text-white mb-4">💰 Money-Saving Tips</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-green-400 font-medium mb-3">AI Coding Efficiency</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>• Use specific, detailed prompts to reduce iterations</li>
                <li>• Break complex features into smaller, focused requests</li>
                <li>• Provide context about your existing codebase</li>
                <li>• Ask for explanations to learn and reduce future questions</li>
              </ul>
            </div>
            <div>
              <h3 className="text-blue-400 font-medium mb-3">Development Strategy</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>• Start with MVP features only</li>
                <li>• Use proven tech stacks to avoid debugging</li>
                <li>• Implement proper error handling early</li>
                <li>• Use existing libraries instead of building from scratch</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BestPractices;
