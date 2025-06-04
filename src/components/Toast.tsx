import React from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useToasts } from '@/hooks/useStore';

const Toast: React.FC = () => {
  const { toasts, removeToast } = useToasts();

  const getIcon = (type: 'success' | 'error' | 'info') => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getStyles = (type: 'success' | 'error' | 'info') => {
    switch (type) {
      case 'success':
        return 'bg-green-900/90 border-green-400/50 text-green-100';
      case 'error':
        return 'bg-red-900/90 border-red-400/50 text-red-100';
      case 'info':
      default:
        return 'bg-blue-900/90 border-blue-400/50 text-blue-100';
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center space-x-3 p-4 rounded-lg border backdrop-blur-sm max-w-sm transform transition-all duration-300 ${getStyles(toast.type)}`}
        >
          {getIcon(toast.type)}
          <span className="flex-1 text-sm font-medium">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="p-1 hover:bg-white/10 rounded transition-colors"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default React.memo(Toast); 