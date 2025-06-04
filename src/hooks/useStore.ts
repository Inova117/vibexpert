import { useCallback } from 'react';
import { useAppStore } from '@/lib/store';

// Optimized selectors that prevent unnecessary re-renders
export const useToasts = () => {
  const toasts = useAppStore((state) => state.toasts);
  const removeToast = useAppStore((state) => state.removeToast);
  const addToast = useAppStore((state) => state.addToast);

  const memoizedRemoveToast = useCallback((id: string) => {
    removeToast(id);
  }, [removeToast]);

  const memoizedAddToast = useCallback((message: string, type?: 'success' | 'error' | 'info') => {
    addToast(message, type);
  }, [addToast]);

  return {
    toasts,
    removeToast: memoizedRemoveToast,
    addToast: memoizedAddToast,
  };
};

export const useTheme = () => {
  const theme = useAppStore((state) => state.theme);
  const setTheme = useAppStore((state) => state.setTheme);
  
  const memoizedSetTheme = useCallback((theme: 'light' | 'dark' | 'system') => {
    setTheme(theme);
  }, [setTheme]);

  return {
    theme,
    setTheme: memoizedSetTheme,
  };
};

export const useSidebar = () => {
  const sidebarOpen = useAppStore((state) => state.sidebarOpen);
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);
  const setSidebarOpen = useAppStore((state) => state.setSidebarOpen);

  const memoizedToggleSidebar = useCallback(() => {
    toggleSidebar();
  }, [toggleSidebar]);

  const memoizedSetSidebarOpen = useCallback((open: boolean) => {
    setSidebarOpen(open);
  }, [setSidebarOpen]);

  return {
    sidebarOpen,
    toggleSidebar: memoizedToggleSidebar,
    setSidebarOpen: memoizedSetSidebarOpen,
  };
}; 