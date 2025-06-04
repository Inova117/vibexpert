// API simulation hooks with realistic latency and error handling
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Simulated API delay
const simulateApiCall = <T>(data: T, delay: number = 500): Promise<T> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 10% chance of error for testing
      if (Math.random() < 0.1) {
        reject(new Error('Simulated API error'));
      } else {
        resolve(data);
      }
    }, delay);
  });
};

// Mock data
const mockProjects = [
  {
    id: '1',
    name: 'E-commerce MVP',
    description: 'Online store with payment integration',
    tech_stack: 'React + Supabase',
    created_at: new Date().toISOString(),
    status: 'active'
  },
  {
    id: '2', 
    name: 'SaaS Dashboard',
    description: 'Analytics dashboard for businesses',
    tech_stack: 'Next.js + PostgreSQL',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    status: 'draft'
  }
];

const mockTemplates = [
  {
    id: 'template-1',
    name: 'React SaaS Starter',
    description: 'Complete SaaS boilerplate with auth and payments',
    category: 'saas',
    tech_stack: 'react_typescript',
    downloads: 1250,
    rating: 4.8
  },
  {
    id: 'template-2',
    name: 'E-commerce Store',
    description: 'Full-featured online store template',
    category: 'ecommerce',
    tech_stack: 'nextjs',
    downloads: 890,
    rating: 4.6
  }
];

// Projects API
export const useProjects = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => simulateApiCall(mockProjects),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useProject = (id: string) => {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => simulateApiCall(mockProjects.find(p => p.id === id)),
    enabled: !!id,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (projectData: any) => {
      const newProject = {
        id: Date.now().toString(),
        ...projectData,
        created_at: new Date().toISOString(),
        status: 'active'
      };
      return simulateApiCall(newProject, 800);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const updatedProject = { id, ...updates, updated_at: new Date().toISOString() };
      return simulateApiCall(updatedProject, 600);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', data.id] });
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => simulateApiCall({ success: true }, 400),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

// Templates API
export const useTemplates = (category?: string) => {
  return useQuery({
    queryKey: ['templates', category],
    queryFn: () => {
      const filtered = category 
        ? mockTemplates.filter(t => t.category === category)
        : mockTemplates;
      return simulateApiCall(filtered);
    },
  });
};

export const useTemplate = (id: string) => {
  return useQuery({
    queryKey: ['template', id],
    queryFn: () => simulateApiCall(mockTemplates.find(t => t.id === id)),
    enabled: !!id,
  });
};

// Scaffold Generation API
export const useGenerateScaffold = () => {
  return useMutation({
    mutationFn: (scaffoldData: {
      appIdea: string;
      frontendStack: string;
      backendStack: string;
      authType: string;
    }) => {
      const scaffold = {
        id: Date.now().toString(),
        ...scaffoldData,
        file_structure: {
          src: {
            components: ['ui', 'layout', 'forms'],
            pages: ['Home.tsx', 'Dashboard.tsx', 'Settings.tsx'],
            hooks: ['useAuth.ts', 'useApi.ts'],
            lib: ['utils.ts', 'constants.ts', 'supabase.ts'],
            types: ['index.ts', 'database.ts']
          },
          supabase: {
            migrations: ['001_initial.sql'],
            functions: ['auth-handler', 'api-endpoints']
          }
        },
        created_at: new Date().toISOString(),
        status: 'generated'
      };
      return simulateApiCall(scaffold, 1200); // Longer delay for generation
    },
  });
};

// Auth simulation
export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate auth check
    setTimeout(() => {
      const savedUser = localStorage.getItem('mock-user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      setLoading(false);
    }, 300);
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const mockUser = {
      id: 'user-1',
      email,
      name: email.split('@')[0],
      created_at: new Date().toISOString()
    };
    
    await simulateApiCall(mockUser, 800);
    localStorage.setItem('mock-user', JSON.stringify(mockUser));
    setUser(mockUser);
    setLoading(false);
    return mockUser;
  };

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    const mockUser = {
      id: 'user-' + Date.now(),
      email,
      name: email.split('@')[0],
      created_at: new Date().toISOString()
    };
    
    await simulateApiCall(mockUser, 1000);
    localStorage.setItem('mock-user', JSON.stringify(mockUser));
    setUser(mockUser);
    setLoading(false);
    return mockUser;
  };

  const signOut = async () => {
    setLoading(true);
    await simulateApiCall(null, 300);
    localStorage.removeItem('mock-user');
    setUser(null);
    setLoading(false);
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user
  };
};

// Error boundary hook
export const useErrorBoundary = () => {
  const [error, setError] = useState<Error | null>(null);

  const resetError = () => setError(null);

  const captureError = (error: Error) => {
    console.error('API Error captured:', error);
    setError(error);
    // In real app, send to error reporting service
  };

  return { error, resetError, captureError };
}; 