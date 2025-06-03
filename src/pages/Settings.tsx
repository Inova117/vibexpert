import React, { useState } from 'react';
import { User, Bell, Palette, Download, Trash2, Github, Users, CreditCard, ExternalLink, Check, X, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const Settings: React.FC = () => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [repoUrl, setRepoUrl] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'success' | 'error'>('idle');
  const [newCollaborator, setNewCollaborator] = useState('');
  const [pendingInvites] = useState(['john@dev.com', 'sarah@startup.io']);

  const clearProjectData = () => {
    localStorage.removeItem('vibe-builder-data');
    alert('Project data cleared successfully!');
  };

  const exportSettings = () => {
    const settings = {
      notifications,
      darkMode,
      autoSave,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vibe-builder-settings.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRepoConnect = () => {
    setConnectionStatus('connecting');
    // Simulate connection
    setTimeout(() => {
      setConnectionStatus(Math.random() > 0.3 ? 'success' : 'error');
    }, 2000);
  };

  const addCollaborator = () => {
    if (newCollaborator) {
      // Simulate sending invite
      setNewCollaborator('');
      alert(`Invite sent to ${newCollaborator}`);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">Settings</h1>
          <p className="text-gray-400">
            Customize your Vibe-Builder experience and manage your preferences.
          </p>
        </div>

        {/* GitHub Integration */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
            <Github className="text-orange-400" size={20} />
            <span>GitHub Repository Integration</span>
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-white font-medium mb-2">Repository URL</label>
              <div className="flex space-x-3">
                <input
                  type="url"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/username/repository"
                  className="flex-1 px-4 py-3 bg-black/20 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50"
                />
                <button
                  onClick={handleRepoConnect}
                  disabled={!repoUrl || connectionStatus === 'connecting'}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-xl text-white font-medium transition-colors"
                >
                  {connectionStatus === 'connecting' ? 'Connecting...' : 'Connect'}
                </button>
              </div>
            </div>
            
            {connectionStatus === 'success' && (
              <div className="flex items-center space-x-2 p-3 bg-green-500/10 border border-green-400/20 rounded-lg">
                <Check className="text-green-400" size={16} />
                <span className="text-green-300 text-sm">Successfully connected to repository</span>
              </div>
            )}
            
            {connectionStatus === 'error' && (
              <div className="flex items-center space-x-2 p-3 bg-red-500/10 border border-red-400/20 rounded-lg">
                <X className="text-red-400" size={16} />
                <span className="text-red-300 text-sm">Failed to connect. Please check the URL and try again.</span>
              </div>
            )}
          </div>
        </div>

        {/* Collaborators */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
            <Users className="text-green-400" size={20} />
            <span>Team Collaborators</span>
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-white font-medium mb-2">Invite by Email</label>
              <div className="flex space-x-3">
                <input
                  type="email"
                  value={newCollaborator}
                  onChange={(e) => setNewCollaborator(e.target.value)}
                  placeholder="developer@company.com"
                  className="flex-1 px-4 py-3 bg-black/20 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400/50"
                />
                <button
                  onClick={addCollaborator}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-xl text-white font-medium transition-colors flex items-center space-x-2"
                >
                  <Plus size={16} />
                  <span>Invite</span>
                </button>
              </div>
            </div>
            
            {pendingInvites.length > 0 && (
              <div>
                <h3 className="text-white font-medium mb-3">Pending Invites</h3>
                <div className="space-y-2">
                  {pendingInvites.map((email, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                      <span className="text-gray-300">{email}</span>
                      <span className="text-yellow-400 text-sm">Pending</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Payment & Export */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
            <CreditCard className="text-purple-400" size={20} />
            <span>Payment & Premium Features</span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <button className="w-full flex items-center justify-center space-x-2 p-4 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors">
                <CreditCard size={20} />
                <span>Setup Stripe Payment</span>
              </button>
              <p className="text-gray-400 text-sm">
                Configure payment processing for your generated MVPs
              </p>
            </div>
            
            <div className="space-y-4">
              <Dialog>
                <DialogTrigger asChild>
                  <button className="w-full flex items-center justify-center space-x-2 p-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg text-white transition-colors">
                    <ExternalLink size={20} />
                    <span>Upgrade to Custom Design</span>
                  </button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border border-white/20">
                  <DialogHeader>
                    <DialogTitle className="text-white">Premium Features</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 text-gray-300">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Check className="text-green-400" size={16} />
                        <span>Custom UI component library</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check className="text-green-400" size={16} />
                        <span>Advanced authentication flows</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check className="text-green-400" size={16} />
                        <span>Production-ready deployment configs</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check className="text-green-400" size={16} />
                        <span>Advanced security patterns</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check className="text-green-400" size={16} />
                        <span>Priority support & consultation</span>
                      </div>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      Upgrade Now - $49/month
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <p className="text-gray-400 text-sm">
                Access premium scaffolding templates and advanced features
              </p>
            </div>
          </div>
        </div>

        {/* Profile Settings */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
            <User className="text-blue-400" size={20} />
            <span>Profile Settings</span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-white font-medium mb-2">Display Name</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50"
                />
              </div>
              
              <div>
                <label className="block text-white font-medium mb-2">Email</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white font-medium mb-2">Preferred Stack</label>
                <select className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50">
                  <option value="" className="bg-gray-800">Select default stack...</option>
                  <option value="react" className="bg-gray-800">React + TypeScript</option>
                  <option value="vue" className="bg-gray-800">Vue.js + TypeScript</option>
                  <option value="angular" className="bg-gray-800">Angular</option>
                  <option value="svelte" className="bg-gray-800">SvelteKit</option>
                </select>
              </div>
              
              <div>
                <label className="block text-white font-medium mb-2">Default Auth</label>
                <select className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50">
                  <option value="" className="bg-gray-800">Select default auth...</option>
                  <option value="email" className="bg-gray-800">Email/Password</option>
                  <option value="oauth" className="bg-gray-800">OAuth (Google, GitHub)</option>
                  <option value="magic" className="bg-gray-800">Magic Links</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* App Preferences */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
            <Palette className="text-purple-400" size={20} />
            <span>App Preferences</span>
          </h2>
          
          <div className="space-y-6">
            {/* Toggle Settings */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
                <div>
                  <h3 className="text-white font-medium">Notifications</h3>
                  <p className="text-gray-400 text-sm">Get notified about updates</p>
                </div>
                <button
                  onClick={() => setNotifications(!notifications)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    notifications ? 'bg-blue-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    notifications ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
                <div>
                  <h3 className="text-white font-medium">Dark Mode</h3>
                  <p className="text-gray-400 text-sm">Dark theme interface</p>
                </div>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    darkMode ? 'bg-blue-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    darkMode ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
                <div>
                  <h3 className="text-white font-medium">Auto Save</h3>
                  <p className="text-gray-400 text-sm">Save progress automatically</p>
                </div>
                <button
                  onClick={() => setAutoSave(!autoSave)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    autoSave ? 'bg-blue-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    autoSave ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications Settings */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
            <Bell className="text-green-400" size={20} />
            <span>Notification Preferences</span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-white font-medium">Email Notifications</h3>
              {[
                'New feature announcements',
                'Weekly development tips',
                'Security updates',
                'Community highlights'
              ].map((item, index) => (
                <label key={index} className="flex items-center space-x-3 text-gray-300">
                  <input type="checkbox" className="rounded border-gray-600 bg-black/20" defaultChecked />
                  <span className="text-sm">{item}</span>
                </label>
              ))}
            </div>
            
            <div className="space-y-4">
              <h3 className="text-white font-medium">In-App Notifications</h3>
              {[
                'Project generation complete',
                'Export status updates',
                'Best practice reminders',
                'New prompt templates'
              ].map((item, index) => (
                <label key={index} className="flex items-center space-x-3 text-gray-300">
                  <input type="checkbox" className="rounded border-gray-600 bg-black/20" defaultChecked />
                  <span className="text-sm">{item}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Data Management</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <button
              onClick={exportSettings}
              className="flex items-center justify-center space-x-2 p-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
            >
              <Download size={20} />
              <span>Export Settings</span>
            </button>
            
            <button
              onClick={clearProjectData}
              className="flex items-center justify-center space-x-2 p-4 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors"
            >
              <Trash2 size={20} />
              <span>Clear Project Data</span>
            </button>
          </div>
          
          <div className="mt-6 p-4 bg-orange-500/10 border border-orange-400/20 rounded-lg">
            <p className="text-orange-300 text-sm">
              <strong>Note:</strong> Clearing project data will remove all saved app ideas and generated scaffolds. 
              This action cannot be undone.
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-center">
          <button className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg text-white font-semibold transition-colors">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
