import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Types
interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role?: 'user' | 'admin';
  created_at: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  tech_stack: string;
  created_at: string;
  updated_at?: string;
  status: 'draft' | 'active' | 'archived';
  file_structure?: any;
}

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  tech_stack: string;
  downloads: number;
  rating: number;
  featured?: boolean;
}

interface AppState {
  // Auth state
  user: User | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  
  // App state
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  notifications: boolean;
  
  // Project state
  currentProject: Project | null;
  projects: Project[];
  projectsLoading: boolean;
  
  // Template state
  templates: Template[];
  templatesLoading: boolean;
  selectedCategory: string | null;
  
  // UI state
  errors: string[];
  toasts: Array<{ id: string; message: string; type: 'success' | 'error' | 'info' }>;
}

interface AppActions {
  // Auth actions
  setUser: (user: User | null) => void;
  setAuthLoading: (loading: boolean) => void;
  signOut: () => void;
  
  // App actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setNotifications: (enabled: boolean) => void;
  
  // Project actions
  setCurrentProject: (project: Project | null) => void;
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  removeProject: (id: string) => void;
  setProjectsLoading: (loading: boolean) => void;
  
  // Template actions
  setTemplates: (templates: Template[]) => void;
  setTemplatesLoading: (loading: boolean) => void;
  setSelectedCategory: (category: string | null) => void;
  
  // UI actions
  addError: (error: string) => void;
  removeError: (index: number) => void;
  clearErrors: () => void;
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

type AppStore = AppState & AppActions;

const initialState: AppState = {
  // Auth
  user: null,
  isAuthenticated: false,
  authLoading: true,
  
  // App
  theme: 'dark',
  sidebarOpen: true,
  notifications: true,
  
  // Projects
  currentProject: null,
  projects: [],
  projectsLoading: false,
  
  // Templates
  templates: [],
  templatesLoading: false,
  selectedCategory: null,
  
  // UI
  errors: [],
  toasts: [],
};

export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        // Auth actions
        setUser: (user) => set({ 
          user, 
          isAuthenticated: !!user,
          authLoading: false 
        }),
        
        setAuthLoading: (authLoading) => set({ authLoading }),
        
        signOut: () => set({ 
          user: null, 
          isAuthenticated: false,
          currentProject: null,
          projects: [],
          authLoading: false
        }),
        
        // App actions
        setTheme: (theme) => set({ theme }),
        
        toggleSidebar: () => set((state) => ({ 
          sidebarOpen: !state.sidebarOpen 
        })),
        
        setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
        
        setNotifications: (notifications) => set({ notifications }),
        
        // Project actions
        setCurrentProject: (currentProject) => set({ currentProject }),
        
        setProjects: (projects) => set({ projects }),
        
        addProject: (project) => set((state) => ({
          projects: [project, ...state.projects]
        })),
        
        updateProject: (id, updates) => set((state) => ({
          projects: state.projects.map(p => 
            p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p
          ),
          currentProject: state.currentProject?.id === id 
            ? { ...state.currentProject, ...updates, updated_at: new Date().toISOString() }
            : state.currentProject
        })),
        
        removeProject: (id) => set((state) => ({
          projects: state.projects.filter(p => p.id !== id),
          currentProject: state.currentProject?.id === id ? null : state.currentProject
        })),
        
        setProjectsLoading: (projectsLoading) => set({ projectsLoading }),
        
        // Template actions
        setTemplates: (templates) => set({ templates }),
        
        setTemplatesLoading: (templatesLoading) => set({ templatesLoading }),
        
        setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
        
        // UI actions
        addError: (error) => set((state) => ({
          errors: [...state.errors, error]
        })),
        
        removeError: (index) => set((state) => ({
          errors: state.errors.filter((_, i) => i !== index)
        })),
        
        clearErrors: () => set({ errors: [] }),
        
        addToast: (message, type = 'info') => {
          const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
          set((state) => ({
            toasts: [...state.toasts, { id, message, type }]
          }));
          
          // Auto-remove toast after 5 seconds
          setTimeout(() => {
            set((state) => ({
              toasts: state.toasts.filter(t => t.id !== id)
            }));
          }, 5000);
        },
        
        removeToast: (id) => set((state) => ({
          toasts: state.toasts.filter(t => t.id !== id)
        })),
        
        clearToasts: () => set({ toasts: [] }),
      }),
      {
        name: 'vibe-forge-storage',
        partialize: (state) => ({
          // Only persist these fields
          theme: state.theme,
          sidebarOpen: state.sidebarOpen,
          notifications: state.notifications,
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    {
      name: 'vibe-forge-store',
    }
  )
);

// Memoized selectors for better performance
export const useUser = () => useAppStore((state) => state.user);

export const useAuth = () => useAppStore((state) => ({
  user: state.user,
  isAuthenticated: state.isAuthenticated,
  authLoading: state.authLoading,
  signOut: state.signOut,
}));

export const useProjects = () => useAppStore((state) => ({
  projects: state.projects,
  currentProject: state.currentProject,
  projectsLoading: state.projectsLoading,
  setCurrentProject: state.setCurrentProject,
  addProject: state.addProject,
  updateProject: state.updateProject,
  removeProject: state.removeProject,
}));

export const useTemplates = () => useAppStore((state) => ({
  templates: state.templates,
  templatesLoading: state.templatesLoading,
  selectedCategory: state.selectedCategory,
  setSelectedCategory: state.setSelectedCategory,
}));

export const useUI = () => useAppStore((state) => ({
  theme: state.theme,
  sidebarOpen: state.sidebarOpen,
  notifications: state.notifications,
  errors: state.errors,
  toasts: state.toasts,
  setTheme: state.setTheme,
  toggleSidebar: state.toggleSidebar,
  setSidebarOpen: state.setSidebarOpen,
  addError: state.addError,
  addToast: state.addToast,
  removeToast: state.removeToast,
})); 