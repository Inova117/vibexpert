
import React, { useState } from 'react';
import { Github, Download, ExternalLink, Users, Plus, Crown, Check, X, Shield, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

const ExportIntegration: React.FC = () => {
  const [repoUrl, setRepoUrl] = useState('');
  const [githubStatus, setGithubStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [downloadReady, setDownloadReady] = useState(true);
  const [deploymentState, setDeploymentState] = useState<'idle' | 'deploying' | 'deployed' | 'error'>('idle');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  
  const [teamMembers] = useState([
    { id: 1, email: 'john@startup.dev', role: 'Owner', status: 'active' },
    { id: 2, email: 'sarah@startup.dev', role: 'Developer', status: 'active' },
    { id: 3, email: 'mike@startup.dev', role: 'Viewer', status: 'active' }
  ]);
  
  const [pendingInvites] = useState([
    { id: 4, email: 'alex@freelancer.com', role: 'Developer', status: 'pending' },
    { id: 5, email: 'lisa@designer.io', role: 'Viewer', status: 'pending' }
  ]);

  const handleGithubConnect = () => {
    setGithubStatus('connecting');
    setTimeout(() => {
      setGithubStatus(Math.random() > 0.3 ? 'connected' : 'error');
    }, 2000);
  };

  const handleDownload = () => {
    // Simulate download
    const blob = new Blob(['# Generated Scaffold\nYour MVP scaffold files...'], { type: 'application/zip' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mvp-scaffold.zip';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleVercelDeploy = () => {
    setDeploymentState('deploying');
    setTimeout(() => {
      setDeploymentState(Math.random() > 0.4 ? 'deployed' : 'error');
    }, 3000);
  };

  const inviteMember = () => {
    if (newMemberEmail) {
      setNewMemberEmail('');
      alert(`Invite sent to ${newMemberEmail}`);
    }
  };

  const removeMember = (email: string) => {
    alert(`Removed ${email} from team`);
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">Export & Integration</h1>
          <p className="text-gray-400">
            Connect your development tools and manage your team collaboration.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Export & Integration */}
          <div className="space-y-8">
            {/* GitHub Integration */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
                <Github className="text-orange-400" size={20} />
                <span>Connect GitHub Repository</span>
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
                      className="flex-1 px-4 py-3 bg-black/20 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50"
                    />
                    <button
                      onClick={handleGithubConnect}
                      disabled={!repoUrl || githubStatus === 'connecting'}
                      className="px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-xl text-white font-medium transition-colors"
                    >
                      {githubStatus === 'connecting' ? 'Connecting...' : 'Connect'}
                    </button>
                  </div>
                </div>
                
                {githubStatus === 'connected' && (
                  <div className="flex items-center space-x-2 p-3 bg-green-500/10 border border-green-400/20 rounded-lg">
                    <Check className="text-green-400" size={16} />
                    <span className="text-green-300 text-sm">Repository connected successfully</span>
                  </div>
                )}
                
                {githubStatus === 'error' && (
                  <div className="flex items-center space-x-2 p-3 bg-red-500/10 border border-red-400/20 rounded-lg">
                    <X className="text-red-400" size={16} />
                    <span className="text-red-300 text-sm">Connection failed. Check repository URL and permissions.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Download Scaffold */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
                <Download className="text-blue-400" size={20} />
                <span>Download Scaffold</span>
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
                  <div>
                    <h3 className="text-white font-medium">MVP Scaffold ZIP</h3>
                    <p className="text-gray-400 text-sm">Complete project structure with configs</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {downloadReady && <Check className="text-green-400" size={16} />}
                    <span className="text-green-300 text-sm">Ready</span>
                  </div>
                </div>
                
                <button
                  onClick={handleDownload}
                  disabled={!downloadReady}
                  className="w-full flex items-center justify-center space-x-2 p-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
                >
                  <Download size={20} />
                  <span>Download ZIP</span>
                </button>
              </div>
            </div>

            {/* Vercel Deployment */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
                <ExternalLink className="text-purple-400" size={20} />
                <span>Deploy to Vercel</span>
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
                  <div>
                    <h3 className="text-white font-medium">Deployment Status</h3>
                    <p className="text-gray-400 text-sm">
                      {deploymentState === 'idle' && 'Ready to deploy'}
                      {deploymentState === 'deploying' && 'Deploying to Vercel...'}
                      {deploymentState === 'deployed' && 'Deployed successfully'}
                      {deploymentState === 'error' && 'Deployment failed'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {deploymentState === 'deployed' && <Check className="text-green-400" size={16} />}
                    {deploymentState === 'error' && <X className="text-red-400" size={16} />}
                    <span className={`text-sm ${
                      deploymentState === 'deployed' ? 'text-green-300' :
                      deploymentState === 'error' ? 'text-red-300' :
                      deploymentState === 'deploying' ? 'text-yellow-300' :
                      'text-gray-300'
                    }`}>
                      {deploymentState === 'idle' ? 'Ready' :
                       deploymentState === 'deploying' ? 'Deploying' :
                       deploymentState === 'deployed' ? 'Live' :
                       'Failed'}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={handleVercelDeploy}
                  disabled={deploymentState === 'deploying'}
                  className="w-full flex items-center justify-center space-x-2 p-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
                >
                  <ExternalLink size={20} />
                  <span>{deploymentState === 'deploying' ? 'Deploying...' : 'Deploy to Vercel'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Team & Collaboration */}
          <div className="space-y-8">
            {/* Team Members */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
                <Users className="text-green-400" size={20} />
                <span>Team & Collaboration</span>
              </h2>
              
              <div className="space-y-6">
                {/* Invite New Member */}
                <div>
                  <label className="block text-white font-medium mb-2">Invite Team Member</label>
                  <div className="flex space-x-3">
                    <input
                      type="email"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      placeholder="developer@company.com"
                      className="flex-1 px-4 py-3 bg-black/20 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400/50"
                    />
                    <button
                      onClick={inviteMember}
                      className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-xl text-white font-medium transition-colors flex items-center space-x-2"
                    >
                      <Plus size={16} />
                      <span>Invite</span>
                    </button>
                  </div>
                </div>

                {/* Current Team Members */}
                <div>
                  <h3 className="text-white font-medium mb-3">Team Members</h3>
                  <div className="space-y-2">
                    {teamMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {member.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white text-sm">{member.email}</p>
                            <p className="text-gray-400 text-xs">{member.role}</p>
                          </div>
                        </div>
                        {member.role !== 'Owner' && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button className="p-1 hover:bg-red-500/20 rounded text-red-400 hover:text-red-300 transition-colors">
                                <Trash2 size={16} />
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-gray-900 border border-white/20">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-white">Remove Team Member</AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-300">
                                  Are you sure you want to remove {member.email} from the team? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-600">Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => removeMember(member.email)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pending Invites */}
                {pendingInvites.length > 0 && (
                  <div>
                    <h3 className="text-white font-medium mb-3">Pending Invites</h3>
                    <div className="space-y-2">
                      {pendingInvites.map((invite) => (
                        <div key={invite.id} className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-gray-300 text-sm font-medium">
                              {invite.email.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-white text-sm">{invite.email}</p>
                              <p className="text-gray-400 text-xs">{invite.role}</p>
                            </div>
                          </div>
                          <span className="text-yellow-400 text-sm">Pending</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Role Permissions Info */}
                <div className="p-4 bg-blue-500/10 border border-blue-400/20 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Shield className="text-blue-400 mt-0.5" size={16} />
                    <div>
                      <h4 className="text-blue-300 font-medium text-sm">Role-Based Permissions</h4>
                      <div className="text-blue-200 text-xs mt-1 space-y-1">
                        <p><strong>Owner:</strong> Full access, billing, team management</p>
                        <p><strong>Developer:</strong> Code access, deploy, edit settings</p>
                        <p><strong>Viewer:</strong> Read-only access to projects</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Support */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
                <Crown className="text-yellow-400" size={20} />
                <span>Premium Support</span>
              </h2>
              
              <Dialog>
                <DialogTrigger asChild>
                  <button className="w-full flex items-center justify-center space-x-2 p-4 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 rounded-lg text-white transition-colors">
                    <Crown size={20} />
                    <span>Upgrade to Premium Support</span>
                  </button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border border-white/20 max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-white flex items-center space-x-2">
                      <Crown className="text-yellow-400" size={20} />
                      <span>Premium Support Benefits</span>
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 text-gray-300">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Check className="text-green-400" size={16} />
                        <span>Priority 1-hour response time</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check className="text-green-400" size={16} />
                        <span>Dedicated Slack channel support</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check className="text-green-400" size={16} />
                        <span>Code review & optimization</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check className="text-green-400" size={16} />
                        <span>Custom deployment workflows</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check className="text-green-400" size={16} />
                        <span>Advanced security audit</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check className="text-green-400" size={16} />
                        <span>White-label scaffold exports</span>
                      </div>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700">
                      Upgrade Now - $99/month
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              
              <p className="text-gray-400 text-sm mt-4 text-center">
                Get expert help scaling your MVP to production
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportIntegration;
