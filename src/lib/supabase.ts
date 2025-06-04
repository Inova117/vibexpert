import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Types for our database schema
export interface User {
  id: string
  email: string
  display_name?: string
  avatar_url?: string
  subscription_tier: 'free' | 'pro' | 'team' | 'enterprise'
  projects_generated: number
  monthly_generations: number
  preferences?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  user_id: string
  name: string
  description: string
  status: 'draft' | 'generated' | 'exported' | 'deployed'
  frontend_stack: string
  backend_stack?: string
  auth_method?: string
  file_structure?: Record<string, any>
  database_schema?: any[]
  api_endpoints?: any[]
  deployment_config?: Record<string, any>
  github_repo_url?: string
  deployment_url?: string
  created_at: string
  updated_at: string
}

export interface Template {
  id: string
  name: string
  description: string
  category: string
  frontend_stack: string
  backend_stack?: string
  file_structure: Record<string, any>
  dependencies: Record<string, any>
  is_premium: boolean
  is_featured: boolean
  usage_count: number
  rating_average: number
  created_at: string
} 