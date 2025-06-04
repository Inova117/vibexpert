import React, { useState } from 'react';
import { ArrowRight, Sparkles, Code, Database, Shield, Loader2, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGenerateScaffold } from '@/hooks/useApi';
import { useToasts } from '@/hooks/useStore';

const Home: React.FC = () => {
  const [appIdea, setAppIdea] = useState('');
  const [frontendStack, setFrontendStack] = useState('');
  const [backendStack, setBackendStack] = useState('');
  const [authType, setAuthType] = useState('');
  const [features, setFeatures] = useState<string[]>([]);
  const navigate = useNavigate();
  
  const generateScaffold = useGenerateScaffold();
  const { addToast } = useToasts();

  const featureOptions = [
    { id: 'auth', label: 'User Authentication', icon: Shield },
    { id: 'payments', label: 'Payment Integration', icon: Code },
    { id: 'dashboard', label: 'Admin Dashboard', icon: Database },
    { id: 'api', label: 'REST API', icon: Code },
    { id: 'realtime', label: 'Real-time Features', icon: Sparkles },
    { id: 'mobile', label: 'Mobile Responsive', icon: Code }
  ];

  const toggleFeature = (featureId: string) => {
    setFeatures(prev => 
      prev.includes(featureId) 
        ? prev.filter(f => f !== featureId)
        : [...prev, featureId]
    );
  };

  const handleGenerate = async () => {
    if (!appIdea.trim()) {
      addToast('Please describe your app idea', 'error');
      return;
    }

    try {
      // Store the input data immediately for the loading page
      const scaffoldInput = {
        appIdea: appIdea.trim(),
        frontendStack: frontendStack || 'React + TypeScript + Tailwind',
        backendStack: backendStack || 'Supabase + Edge Functions',
        authType: authType || 'email',
        features,
        timestamp: Date.now()
      };

      localStorage.setItem('vibe-builder-data', JSON.stringify(scaffoldInput));

      // Navigate to loading page immediately
      navigate('/loading');

      // The actual scaffold generation will happen in the loading page
      addToast('Starting scaffold generation...', 'success');
    } catch (error) {
      addToast('Failed to start generation. Please try again.', 'error');
    }
  };

  const isFormValid = appIdea.trim().length > 10;

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
            Vibe-Forge
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
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 space-y-8">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-white mb-2">Generate Your MVP Scaffold</h3>
            <p className="text-gray-400">Describe your idea and we'll create the perfect development blueprint</p>
          </div>

          <div className="space-y-6">
            {/* App Idea - Main Input */}
            <div className="space-y-3">
              <label className="flex items-center space-x-2 text-white font-medium">
                <Sparkles size={16} className="text-blue-400" />
                <span>App Idea*</span>
              </label>
              <textarea
                value={appIdea}
                onChange={(e) => setAppIdea(e.target.value)}
                placeholder="Describe your app idea in detail. What problem does it solve? Who are your users? What are the main features? (minimum 10 characters)"
                className="w-full px-4 py-4 bg-black/20 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 backdrop-blur-sm resize-none"
                rows={4}
                maxLength={1000}
              />
              <div className="flex justify-between items-center text-sm">
                <span className={`${appIdea.length < 10 ? 'text-red-400' : 'text-green-400'}`}>
                  {appIdea.length < 10 ? `${10 - appIdea.length} characters needed` : '✓ Good description'}
                </span>
                <span className="text-gray-500">{appIdea.length}/1000</span>
              </div>
            </div>

            {/* Tech Stack Selection */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="flex items-center space-x-2 text-white font-medium">
                  <Code size={16} className="text-green-400" />
                  <span>Frontend Stack</span>
                </label>
                <select
                  value={frontendStack}
                  onChange={(e) => setFrontendStack(e.target.value)}
                  className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400/50 backdrop-blur-sm"
                >
                  <option value="" className="bg-gray-800">Select frontend...</option>
                  <option value="react_typescript" className="bg-gray-800">React + TypeScript + Tailwind</option>
                  <option value="nextjs" className="bg-gray-800">Next.js 14 + TypeScript</option>
                  <option value="vue" className="bg-gray-800">Vue 3 + TypeScript</option>
                  <option value="svelte" className="bg-gray-800">SvelteKit + TypeScript</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="flex items-center space-x-2 text-white font-medium">
                  <Database size={16} className="text-purple-400" />
                  <span>Backend Stack</span>
                </label>
                <select
                  value={backendStack}
                  onChange={(e) => setBackendStack(e.target.value)}
                  className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 backdrop-blur-sm"
                >
                  <option value="" className="bg-gray-800">Select backend...</option>
                  <option value="supabase" className="bg-gray-800">Supabase + Edge Functions</option>
                  <option value="firebase" className="bg-gray-800">Firebase + Cloud Functions</option>
                  <option value="nodejs" className="bg-gray-800">Node.js + Express + PostgreSQL</option>
                  <option value="python" className="bg-gray-800">Python + FastAPI + PostgreSQL</option>
                </select>
              </div>
            </div>

            {/* Authentication */}
            <div className="space-y-3">
              <label className="flex items-center space-x-2 text-white font-medium">
                <Shield size={16} className="text-orange-400" />
                <span>Authentication</span>
              </label>
              <select
                value={authType}
                onChange={(e) => setAuthType(e.target.value)}
                className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 backdrop-blur-sm"
              >
                <option value="" className="bg-gray-800">Select auth...</option>
                <option value="email" className="bg-gray-800">Email/Password</option>
                <option value="oauth" className="bg-gray-800">OAuth (Google, GitHub)</option>
                <option value="magic" className="bg-gray-800">Magic Links</option>
                <option value="phone" className="bg-gray-800">Phone/SMS</option>
                <option value="custom" className="bg-gray-800">Custom JWT</option>
              </select>
            </div>

            {/* Features Selection */}
            <div className="space-y-4">
              <label className="text-white font-medium">Additional Features</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {featureOptions.map((feature) => {
                  const Icon = feature.icon;
                  const isSelected = features.includes(feature.id);
                  return (
                    <button
                      key={feature.id}
                      onClick={() => toggleFeature(feature.id)}
                      className={`flex items-center space-x-2 p-3 rounded-lg border transition-all ${
                        isSelected
                          ? 'bg-blue-500/20 border-blue-400/50 text-blue-300'
                          : 'bg-black/20 border-white/20 text-gray-400 hover:bg-white/5'
                      }`}
                    >
                      <Icon size={16} />
                      <span className="text-sm">{feature.label}</span>
                      {isSelected && <CheckCircle size={14} className="ml-auto text-blue-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Generate Button */}
            <div className="flex justify-center pt-4">
              <button
                onClick={handleGenerate}
                disabled={!isFormValid || generateScaffold.isPending}
                className="group flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 rounded-xl text-white font-semibold text-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {generateScaffold.isPending ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <span>Generate MVP Scaffold</span>
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
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
