
import React, { useState } from 'react';
import { ArrowRight, Sparkles, Code, Database, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const [appIdea, setAppIdea] = useState('');
  const [frontendStack, setFrontendStack] = useState('');
  const [backendStack, setBackendStack] = useState('');
  const [authType, setAuthType] = useState('');
  const navigate = useNavigate();

  const handleGenerate = () => {
    if (appIdea.trim()) {
      // Store the data for the scaffold page
      localStorage.setItem('vibe-builder-data', JSON.stringify({
        appIdea,
        frontendStack,
        backendStack,
        authType,
        timestamp: Date.now()
      }));
      navigate('/scaffold');
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-400/20">
            <Sparkles size={16} className="text-blue-400" />
            <span className="text-blue-400 text-sm font-medium">AI-Powered MVP Generator</span>
          </div>
          
          <h1 className="text-6xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent leading-tight">
            Vibe-Builder
          </h1>
          
          <h2 className="text-2xl text-gray-300 font-light">
            Instant MVP Generator
          </h2>
          
          <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Transform your app idea into a complete development blueprint. Get optimized file structure, 
            security guidelines, and development best practices before you write a single line of code.
          </p>
        </div>

        {/* Main Form */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
          <div className="space-y-6">
            {/* App Idea Textarea */}
            <div className="space-y-3">
              <label className="block text-white font-medium text-lg">
                Describe your app idea
              </label>
              <textarea
                value={appIdea}
                onChange={(e) => setAppIdea(e.target.value)}
                placeholder="Example: A task management app for remote teams with real-time collaboration, file sharing, and progress tracking. Users can create projects, assign tasks, set deadlines, and communicate through integrated chat..."
                className="w-full h-32 px-4 py-3 bg-black/20 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 resize-none backdrop-blur-sm"
                rows={4}
              />
              <div className="text-right text-sm text-gray-400">
                {appIdea.length}/500 characters
              </div>
            </div>

            {/* Stack Selection */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Frontend Stack */}
              <div className="space-y-3">
                <label className="flex items-center space-x-2 text-white font-medium">
                  <Code size={16} className="text-blue-400" />
                  <span>Frontend Stack</span>
                </label>
                <select
                  value={frontendStack}
                  onChange={(e) => setFrontendStack(e.target.value)}
                  className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 backdrop-blur-sm"
                >
                  <option value="" className="bg-gray-800">Select frontend...</option>
                  <option value="react" className="bg-gray-800">React + TypeScript</option>
                  <option value="vue" className="bg-gray-800">Vue.js + TypeScript</option>
                  <option value="angular" className="bg-gray-800">Angular</option>
                  <option value="svelte" className="bg-gray-800">SvelteKit</option>
                  <option value="nextjs" className="bg-gray-800">Next.js</option>
                </select>
              </div>

              {/* Backend Stack */}
              <div className="space-y-3">
                <label className="flex items-center space-x-2 text-white font-medium">
                  <Database size={16} className="text-green-400" />
                  <span>Backend Stack</span>
                </label>
                <select
                  value={backendStack}
                  onChange={(e) => setBackendStack(e.target.value)}
                  className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400/50 backdrop-blur-sm"
                >
                  <option value="" className="bg-gray-800">Select backend...</option>
                  <option value="nodejs" className="bg-gray-800">Node.js + Express</option>
                  <option value="supabase" className="bg-gray-800">Supabase</option>
                  <option value="firebase" className="bg-gray-800">Firebase</option>
                  <option value="python" className="bg-gray-800">Python + FastAPI</option>
                  <option value="go" className="bg-gray-800">Go + Gin</option>
                </select>
              </div>

              {/* Authentication */}
              <div className="space-y-3">
                <label className="flex items-center space-x-2 text-white font-medium">
                  <Shield size={16} className="text-purple-400" />
                  <span>Authentication</span>
                </label>
                <select
                  value={authType}
                  onChange={(e) => setAuthType(e.target.value)}
                  className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 backdrop-blur-sm"
                >
                  <option value="" className="bg-gray-800">Select auth...</option>
                  <option value="email" className="bg-gray-800">Email/Password</option>
                  <option value="oauth" className="bg-gray-800">OAuth (Google, GitHub)</option>
                  <option value="magic" className="bg-gray-800">Magic Links</option>
                  <option value="custom" className="bg-gray-800">Custom JWT</option>
                </select>
              </div>
            </div>

            {/* Generate Button */}
            <div className="flex justify-center pt-4">
              <button
                onClick={handleGenerate}
                disabled={!appIdea.trim()}
                className="group flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 rounded-xl text-white font-semibold text-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                <span>Generate MVP Scaffold</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Features Preview */}
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Code,
              title: 'Project Structure',
              description: 'Optimized file organization and folder structure for scalability',
              color: 'blue'
            },
            {
              icon: Shield,
              title: 'Security Guidelines',
              description: 'Best practices, security rules, and dos & don\'ts for your stack',
              color: 'green'
            },
            {
              icon: Sparkles,
              title: 'AI Prompts',
              description: 'Optimized prompts to save money on AI coding assistance',
              color: 'purple'
            }
          ].map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6 hover:bg-white/10 transition-colors">
                <div className={`inline-flex p-3 rounded-lg bg-${feature.color}-500/20 border border-${feature.color}-400/30 mb-4`}>
                  <Icon size={24} className={`text-${feature.color}-400`} />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Home;
