import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  CheckCircle, 
  Loader2, 
  Code, 
  Database, 
  Shield, 
  FileText, 
  Sparkles,
  ArrowRight,
  X
} from 'lucide-react';

interface GenerationStep {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  status: 'pending' | 'processing' | 'completed' | 'error';
  duration: number; // in milliseconds
}

const Loading: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const generationSteps: GenerationStep[] = [
    {
      id: 'analyze',
      label: 'Analyzing Requirements',
      description: 'Processing your app idea and extracting key requirements',
      icon: Sparkles,
      status: 'pending',
      duration: 2000
    },
    {
      id: 'structure',
      label: 'Creating Project Structure',
      description: 'Generating optimized folder structure and file organization',
      icon: FileText,
      status: 'pending',
      duration: 3000
    },
    {
      id: 'frontend',
      label: 'Setting Up Frontend',
      description: 'Configuring React components, routing, and UI framework',
      icon: Code,
      status: 'pending',
      duration: 2500
    },
    {
      id: 'backend',
      label: 'Configuring Backend',
      description: 'Setting up database schema, API endpoints, and serverless functions',
      icon: Database,
      status: 'pending',
      duration: 3500
    },
    {
      id: 'security',
      label: 'Implementing Security',
      description: 'Adding authentication, authorization, and security best practices',
      icon: Shield,
      status: 'pending',
      duration: 2000
    },
    {
      id: 'finalize',
      label: 'Finalizing Scaffold',
      description: 'Generating documentation, deployment configs, and final touches',
      icon: CheckCircle,
      status: 'pending',
      duration: 1500
    }
  ];

  const [steps, setSteps] = useState(generationSteps);

  useEffect(() => {
    // Get project data from location state or localStorage
    const projectData = location.state?.projectData || 
      JSON.parse(localStorage.getItem('vibe-builder-data') || '{}');

    if (!projectData.appIdea) {
      // If no project data, redirect to home
      navigate('/');
      return;
    }

    let totalDuration = 0;
    let currentProgress = 0;

    // Calculate total duration
    const totalTime = steps.reduce((acc, step) => acc + step.duration, 0);

    // Process steps sequentially
    const processSteps = async () => {
      for (let i = 0; i < steps.length; i++) {
        // Update current step to processing
        setSteps(prev => prev.map((step, index) => ({
          ...step,
          status: index === i ? 'processing' : index < i ? 'completed' : 'pending'
        })));
        setCurrentStep(i);

        // Simulate processing time with progress updates
        const stepDuration = steps[i].duration;
        const startTime = Date.now();
        
        while (Date.now() - startTime < stepDuration) {
          const elapsed = Date.now() - startTime;
          const stepProgress = Math.min(elapsed / stepDuration, 1);
          const overallProgress = ((totalDuration + elapsed) / totalTime) * 100;
          
          setProgress(Math.min(overallProgress, 100));
          
          // Small delay for smooth animation
          await new Promise(resolve => setTimeout(resolve, 50));
        }

        // Mark step as completed
        setSteps(prev => prev.map((step, index) => ({
          ...step,
          status: index <= i ? 'completed' : 'pending'
        })));

        totalDuration += stepDuration;
        currentProgress = (totalDuration / totalTime) * 100;
        setProgress(currentProgress);

        // Small pause between steps
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // All steps completed, navigate to scaffold page
      setTimeout(() => {
        navigate('/scaffold');
      }, 1000);
    };

    processSteps().catch((err) => {
      console.error('Generation failed:', err);
      setError('Failed to generate scaffold. Please try again.');
      
      // Navigate back to home after error
      setTimeout(() => {
        navigate('/');
      }, 3000);
    });
  }, [navigate, location.state, steps.length]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-md mx-auto text-center space-y-6">
          <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
            <X className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Generation Failed</h1>
          <p className="text-gray-400">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-blue-500/20 rounded-full flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          </div>
          <h1 className="text-4xl font-bold text-white">Generating Your MVP Scaffold</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            We're creating your complete development blueprint with optimized structure, 
            security guidelines, and best practices.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-white font-medium">Overall Progress</span>
            <span className="text-blue-400 font-mono">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-black/30 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === index;
            const isCompleted = step.status === 'completed';
            const isProcessing = step.status === 'processing';
            
            return (
              <div
                key={step.id}
                className={`bg-white/5 backdrop-blur-xl rounded-xl border transition-all duration-300 ${
                  isActive 
                    ? 'border-blue-400/50 bg-blue-500/10' 
                    : isCompleted 
                    ? 'border-green-400/50 bg-green-500/10'
                    : 'border-white/10'
                }`}
              >
                <div className="p-6 flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
                    isCompleted 
                      ? 'bg-green-500/20 border border-green-400/30' 
                      : isProcessing
                      ? 'bg-blue-500/20 border border-blue-400/30'
                      : 'bg-gray-500/20 border border-gray-400/30'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    ) : isProcessing ? (
                      <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                    ) : (
                      <Icon className={`w-6 h-6 ${isActive ? 'text-blue-400' : 'text-gray-500'}`} />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className={`font-semibold transition-colors ${
                      isCompleted ? 'text-green-400' : isActive ? 'text-blue-400' : 'text-white'
                    }`}>
                      {step.label}
                    </h3>
                    <p className="text-gray-400 text-sm">{step.description}</p>
                  </div>
                  
                  {isActive && (
                    <div className="flex items-center space-x-2 text-blue-400">
                      <span className="text-sm">Processing...</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                  
                  {isCompleted && (
                    <div className="text-green-400 text-sm font-medium">
                      ✓ Complete
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Tips */}
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
          <h3 className="text-white font-semibold mb-3">💡 Pro Tips</h3>
          <div className="space-y-2 text-gray-400 text-sm">
            <p>• Your scaffold will include production-ready security configurations</p>
            <p>• All generated code follows TypeScript strict mode and best practices</p>
            <p>• Database migrations and API endpoints are optimized for performance</p>
            <p>• You'll get deployment-ready configurations for Vercel and Supabase</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading; 