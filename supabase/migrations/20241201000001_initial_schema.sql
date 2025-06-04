-- =============================================
-- Vibe-Builder Initial Database Schema
-- Migration: 20241201000001_initial_schema
-- =============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- ENUMS AND CUSTOM TYPES
-- =============================================

-- Subscription tiers for users
CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'team', 'enterprise');

-- Technology stack categories
CREATE TYPE tech_stack AS ENUM (
  'react_typescript',
  'react_javascript', 
  'nextjs',
  'vue_typescript',
  'vue_javascript',
  'angular',
  'svelte',
  'nodejs_express',
  'nodejs_fastify',
  'supabase',
  'firebase',
  'python_fastapi',
  'python_django',
  'go_gin',
  'rust_actix'
);

-- Authentication methods
CREATE TYPE auth_method AS ENUM (
  'email_password',
  'oauth_google',
  'oauth_github', 
  'oauth_discord',
  'magic_link',
  'custom_jwt'
);

-- Project status
CREATE TYPE project_status AS ENUM ('draft', 'generated', 'exported', 'deployed');

-- Template categories
CREATE TYPE template_category AS ENUM (
  'web_app',
  'mobile_app',
  'api_service',
  'fullstack',
  'landing_page',
  'dashboard',
  'ecommerce',
  'blog',
  'saas',
  'marketplace'
);

-- =============================================
-- CORE TABLES
-- =============================================

-- Users table (extends auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  subscription_tier subscription_tier DEFAULT 'free',
  subscription_ends_at TIMESTAMPTZ,
  stripe_customer_id TEXT UNIQUE,
  github_username TEXT,
  preferred_stack tech_stack DEFAULT 'react_typescript',
  timezone TEXT DEFAULT 'UTC',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  
  -- Usage tracking
  projects_generated INTEGER DEFAULT 0,
  monthly_generations INTEGER DEFAULT 0,
  last_generation_reset TIMESTAMPTZ DEFAULT NOW(),
  
  -- Preferences
  preferences JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Templates table for scaffold patterns
CREATE TABLE public.templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category template_category NOT NULL,
  
  -- Technology configuration
  frontend_stack tech_stack NOT NULL,
  backend_stack tech_stack,
  auth_methods auth_method[] DEFAULT ARRAY[]::auth_method[],
  
  -- Template structure and configuration
  file_structure JSONB NOT NULL,
  dependencies JSONB NOT NULL DEFAULT '{}',
  environment_variables JSONB DEFAULT '{}',
  
  -- Metadata
  is_premium BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_community BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES public.users(id),
  
  -- Analytics
  usage_count INTEGER DEFAULT 0,
  rating_average DECIMAL(3,2) DEFAULT 0.00,
  rating_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User projects
CREATE TABLE public.projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  template_id UUID REFERENCES public.templates(id),
  
  -- Project details
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  status project_status DEFAULT 'draft',
  
  -- Configuration
  frontend_stack tech_stack NOT NULL,
  backend_stack tech_stack,
  auth_method auth_method,
  
  -- Generated data
  file_structure JSONB,
  generated_code JSONB,
  database_schema JSONB,
  api_endpoints JSONB,
  deployment_config JSONB,
  
  -- Export data
  github_repo_url TEXT,
  deployment_url TEXT,
  exported_at TIMESTAMPTZ,
  
  -- AI generation metadata
  original_prompt TEXT,
  ai_model_used TEXT,
  generation_time_ms INTEGER,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project collaborators for team features
CREATE TABLE public.project_collaborators (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'viewer' CHECK (role IN ('owner', 'editor', 'viewer')),
  invited_by UUID REFERENCES public.users(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  
  UNIQUE(project_id, user_id)
);

-- Template ratings and reviews
CREATE TABLE public.template_ratings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  template_id UUID REFERENCES public.templates(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  review TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(template_id, user_id)
);

-- User API keys for integrations
CREATE TABLE public.user_api_keys (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  key_preview TEXT NOT NULL, -- Last 4 characters for UI
  scopes TEXT[] DEFAULT ARRAY['read'],
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, name)
);

-- Usage analytics
CREATE TABLE public.usage_analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Users indexes
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_subscription ON public.users(subscription_tier);
CREATE INDEX idx_users_created_at ON public.users(created_at);

-- Projects indexes
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_projects_created_at ON public.projects(created_at);
CREATE INDEX idx_projects_frontend_stack ON public.projects(frontend_stack);

-- Templates indexes
CREATE INDEX idx_templates_category ON public.templates(category);
CREATE INDEX idx_templates_frontend_stack ON public.templates(frontend_stack);
CREATE INDEX idx_templates_is_premium ON public.templates(is_premium);
CREATE INDEX idx_templates_usage_count ON public.templates(usage_count DESC);
CREATE INDEX idx_templates_rating ON public.templates(rating_average DESC);

-- Analytics indexes
CREATE INDEX idx_analytics_user_id ON public.usage_analytics(user_id);
CREATE INDEX idx_analytics_event_type ON public.usage_analytics(event_type);
CREATE INDEX idx_analytics_created_at ON public.usage_analytics(created_at);

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_analytics ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Templates policies (public read, authenticated write for community templates)
CREATE POLICY "Anyone can view public templates" ON public.templates
  FOR SELECT USING (is_community = TRUE OR NOT is_premium);

CREATE POLICY "Premium users can view premium templates" ON public.templates
  FOR SELECT USING (
    is_premium = FALSE OR 
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND subscription_tier IN ('pro', 'team', 'enterprise')
    )
  );

CREATE POLICY "Template creators can manage their templates" ON public.templates
  FOR ALL USING (created_by = auth.uid());

-- Projects policies
CREATE POLICY "Users can manage their own projects" ON public.projects
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Project collaborators can view projects" ON public.projects
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.project_collaborators
      WHERE project_id = projects.id AND user_id = auth.uid()
    )
  );

-- Project collaborators policies
CREATE POLICY "Project owners can manage collaborators" ON public.project_collaborators
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = project_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their collaborations" ON public.project_collaborators
  FOR SELECT USING (user_id = auth.uid());

-- Template ratings policies
CREATE POLICY "Users can manage their own ratings" ON public.template_ratings
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Anyone can view ratings" ON public.template_ratings
  FOR SELECT USING (true);

-- API keys policies
CREATE POLICY "Users can manage their own API keys" ON public.user_api_keys
  FOR ALL USING (user_id = auth.uid());

-- Analytics policies (admin only read)
CREATE POLICY "Only service role can access analytics" ON public.usage_analytics
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON public.users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at 
  BEFORE UPDATE ON public.templates 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at 
  BEFORE UPDATE ON public.projects 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_template_ratings_updated_at 
  BEFORE UPDATE ON public.template_ratings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ language plpgsql security definer;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update template ratings
CREATE OR REPLACE FUNCTION update_template_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.templates
  SET 
    rating_average = (
      SELECT AVG(rating)::DECIMAL(3,2)
      FROM public.template_ratings
      WHERE template_id = NEW.template_id
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM public.template_ratings
      WHERE template_id = NEW.template_id
    )
  WHERE id = NEW.template_id;
  
  RETURN NEW;
END;
$$ language plpgsql;

-- Trigger to update template ratings
CREATE TRIGGER update_template_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.template_ratings
  FOR EACH ROW EXECUTE FUNCTION update_template_rating();

-- Function to reset monthly usage
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS void AS $$
BEGIN
  UPDATE public.users
  SET 
    monthly_generations = 0,
    last_generation_reset = NOW()
  WHERE last_generation_reset < NOW() - INTERVAL '1 month';
END;
$$ language plpgsql;

-- =============================================
-- SEED DATA
-- =============================================

-- Insert default templates
INSERT INTO public.templates (
  name, description, category, frontend_stack, backend_stack, auth_methods, 
  file_structure, dependencies, is_featured
) VALUES
(
  'React + Supabase SaaS Starter',
  'Complete SaaS application with authentication, payments, and dashboard',
  'saas',
  'react_typescript',
  'supabase',
  ARRAY['email_password', 'oauth_google']::auth_method[],
  '{
    "src": {
      "components": ["ui", "auth", "dashboard"],
      "pages": ["Home.tsx", "Dashboard.tsx", "Settings.tsx"],
      "hooks": ["useAuth.ts", "useSupabase.ts"],
      "lib": ["supabase.ts", "stripe.ts", "utils.ts"]
    },
    "supabase": {
      "migrations": ["001_initial.sql"],
      "functions": ["stripe-webhook"]
    }
  }',
  '{
    "dependencies": {
      "@supabase/supabase-js": "^2.38.0",
      "@stripe/stripe-js": "^2.1.0",
      "react": "^18.2.0",
      "typescript": "^5.0.0"
    }
  }',
  true
),
(
  'Next.js E-commerce Store',
  'Full-featured e-commerce platform with product management and payments',
  'ecommerce', 
  'nextjs',
  'supabase',
  ARRAY['email_password', 'oauth_google', 'oauth_github']::auth_method[],
  '{
    "app": {
      "products": ["page.tsx", "[id]/page.tsx"],
      "cart": ["page.tsx"],
      "checkout": ["page.tsx"],
      "admin": ["dashboard", "products", "orders"]
    },
    "components": ["ProductCard", "CartDrawer", "CheckoutForm"],
    "lib": ["stripe", "inventory", "orders"]
  }',
  '{
    "dependencies": {
      "next": "^14.0.0",
      "@stripe/stripe-js": "^2.1.0",
      "zustand": "^4.4.0"
    }
  }',
  true
),
(
  'Vue Dashboard Template',
  'Modern admin dashboard with charts, tables, and user management',
  'dashboard',
  'vue_typescript',
  'nodejs_express',
  ARRAY['custom_jwt']::auth_method[],
  '{
    "src": {
      "views": ["Dashboard", "Users", "Analytics", "Settings"],
      "components": ["Charts", "Tables", "Forms"],
      "composables": ["useApi", "useAuth"],
      "stores": ["auth", "dashboard"]
    }
  }',
  '{
    "dependencies": {
      "vue": "^3.3.0",
      "vue-router": "^4.2.0",
      "pinia": "^2.1.0",
      "chart.js": "^4.4.0"
    }
  }',
  true
);

-- Create monthly usage reset scheduled job (requires pg_cron extension in production)
-- SELECT cron.schedule('reset-monthly-usage', '0 0 1 * *', 'SELECT reset_monthly_usage();'); 