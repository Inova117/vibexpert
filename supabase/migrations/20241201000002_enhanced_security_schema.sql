-- =============================================
-- Enhanced Security & Audit Schema
-- Migration: 20241201000002_enhanced_security_schema
-- =============================================

-- Enable additional extensions for advanced features
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- =============================================
-- ENHANCED ENUMS WITH FUTURE-PROOFING
-- =============================================

-- Enhanced subscription tiers with more granular control
CREATE TYPE subscription_tier_enhanced AS ENUM (
  'free_trial',        -- 7-day trial with full features
  'free',              -- Limited features
  'pro_monthly',       -- Monthly pro subscription
  'pro_yearly',        -- Yearly pro subscription (discount)
  'team_monthly',      -- Team features monthly
  'team_yearly',       -- Team features yearly
  'enterprise',        -- Enterprise with custom limits
  'enterprise_trial',  -- Enterprise trial
  'legacy',            -- Grandfathered users
  'suspended',         -- Suspended accounts
  'churned'            -- Cancelled subscriptions
);

-- Enhanced project status with workflow states
CREATE TYPE project_status_enhanced AS ENUM (
  'draft',             -- Initial creation
  'configuring',       -- User setting up parameters
  'generating',        -- AI processing
  'generated',         -- Successfully generated
  'failed',            -- Generation failed
  'reviewing',         -- User reviewing output
  'approved',          -- User approved scaffold
  'exporting',         -- Export in progress
  'exported',          -- Successfully exported
  'deploying',         -- Deployment in progress
  'deployed',          -- Successfully deployed
  'archived',          -- Archived project
  'deleted'            -- Soft deleted
);

-- User roles with granular permissions
CREATE TYPE user_role AS ENUM (
  'user',              -- Regular user
  'pro_user',          -- Pro subscriber
  'team_owner',        -- Team owner
  'team_admin',        -- Team administrator
  'team_member',       -- Team member
  'moderator',         -- Content moderator
  'admin',             -- Platform admin
  'super_admin'        -- Super administrator
);

-- Template visibility and access control
CREATE TYPE template_visibility AS ENUM (
  'public',            -- Visible to all
  'premium',           -- Premium users only
  'team',              -- Team templates
  'private',           -- Private to creator
  'unlisted',          -- Unlisted but accessible via link
  'deprecated',        -- Deprecated template
  'under_review'       -- Under moderation review
);

-- =============================================
-- ENHANCED USERS TABLE WITH COMPREHENSIVE TRACKING
-- =============================================

-- Drop existing users table to recreate with enhanced structure
DROP TABLE IF EXISTS public.users CASCADE;

CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  
  -- Basic Information
  email TEXT NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  website_url TEXT,
  github_username TEXT,
  twitter_username TEXT,
  
  -- Subscription & Billing
  subscription_tier subscription_tier_enhanced DEFAULT 'free',
  subscription_starts_at TIMESTAMPTZ,
  subscription_ends_at TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  billing_email TEXT,
  
  -- Usage Tracking & Limits
  projects_generated INTEGER DEFAULT 0,
  monthly_generations INTEGER DEFAULT 0,
  monthly_limit INTEGER DEFAULT 3,
  last_generation_reset TIMESTAMPTZ DEFAULT NOW(),
  api_calls_this_month INTEGER DEFAULT 0,
  storage_used_bytes BIGINT DEFAULT 0,
  
  -- User Preferences & Settings
  preferred_stack tech_stack DEFAULT 'react_typescript',
  timezone TEXT DEFAULT 'UTC',
  language TEXT DEFAULT 'en',
  theme TEXT DEFAULT 'dark',
  notifications_enabled BOOLEAN DEFAULT TRUE,
  email_notifications BOOLEAN DEFAULT TRUE,
  marketing_emails BOOLEAN DEFAULT FALSE,
  preferences JSONB DEFAULT '{}',
  
  -- Account Status & Security
  role user_role DEFAULT 'user',
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  email_verified_at TIMESTAMPTZ,
  phone_number TEXT,
  phone_verified_at TIMESTAMPTZ,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  
  -- Onboarding & Experience
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_step INTEGER DEFAULT 0,
  first_project_created_at TIMESTAMPTZ,
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  login_count INTEGER DEFAULT 0,
  
  -- Team & Collaboration
  current_team_id UUID,
  is_team_owner BOOLEAN DEFAULT FALSE,
  
  -- Compliance & Legal
  terms_accepted_at TIMESTAMPTZ,
  privacy_accepted_at TIMESTAMPTZ,
  gdpr_consent BOOLEAN DEFAULT FALSE,
  data_retention_policy TEXT DEFAULT 'standard',
  
  -- Audit Fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  updated_by UUID,
  
  -- Soft Delete
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  
  -- Constraints
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT valid_monthly_limit CHECK (monthly_limit >= 0),
  CONSTRAINT valid_usage_counts CHECK (
    projects_generated >= 0 AND 
    monthly_generations >= 0 AND 
    api_calls_this_month >= 0
  )
);

-- =============================================
-- TEAMS & ORGANIZATION STRUCTURE
-- =============================================

CREATE TABLE public.teams (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  avatar_url TEXT,
  
  -- Subscription & Billing
  subscription_tier subscription_tier_enhanced DEFAULT 'team_monthly',
  subscription_ends_at TIMESTAMPTZ,
  stripe_customer_id TEXT UNIQUE,
  
  -- Limits & Usage
  member_limit INTEGER DEFAULT 5,
  project_limit INTEGER DEFAULT 100,
  monthly_generation_limit INTEGER DEFAULT 500,
  current_projects INTEGER DEFAULT 0,
  current_generations INTEGER DEFAULT 0,
  
  -- Settings
  is_active BOOLEAN DEFAULT TRUE,
  allow_member_invites BOOLEAN DEFAULT TRUE,
  require_admin_approval BOOLEAN DEFAULT FALSE,
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES public.users(id),
  
  CONSTRAINT valid_slug CHECK (slug ~* '^[a-z0-9-]+$'),
  CONSTRAINT valid_limits CHECK (
    member_limit > 0 AND 
    project_limit >= 0 AND 
    monthly_generation_limit >= 0
  )
);

CREATE TABLE public.team_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Role & Permissions
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'guest')),
  permissions JSONB DEFAULT '{}',
  
  -- Invitation & Status
  invitation_token TEXT UNIQUE,
  invited_by UUID REFERENCES public.users(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'removed')),
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(team_id, user_id)
);

-- =============================================
-- ENHANCED PROJECTS WITH COMPREHENSIVE TRACKING
-- =============================================

DROP TABLE IF EXISTS public.projects CASCADE;

CREATE TABLE public.projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Ownership & Access
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  template_id UUID REFERENCES public.templates(id) ON DELETE SET NULL,
  
  -- Basic Information
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  slug TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Status & Workflow
  status project_status_enhanced DEFAULT 'draft',
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'team', 'public')),
  
  -- Technical Configuration
  frontend_stack tech_stack NOT NULL,
  backend_stack tech_stack,
  auth_method auth_method,
  database_type TEXT DEFAULT 'postgresql',
  
  -- Generated Content
  file_structure JSONB,
  generated_code JSONB,
  database_schema JSONB,
  api_endpoints JSONB,
  deployment_config JSONB,
  security_config JSONB,
  testing_config JSONB,
  ci_cd_config JSONB,
  
  -- AI & Generation Metadata
  original_prompt TEXT,
  processed_prompt TEXT,
  ai_model_used TEXT DEFAULT 'gpt-4-turbo',
  generation_time_ms INTEGER,
  generation_cost_cents INTEGER,
  generation_tokens_used INTEGER,
  generation_quality_score DECIMAL(3,2),
  
  -- Export & Deployment
  github_repo_url TEXT,
  github_repo_id TEXT,
  deployment_url TEXT,
  deployment_provider TEXT,
  last_export_at TIMESTAMPTZ,
  last_deployment_at TIMESTAMPTZ,
  
  -- Analytics & Usage
  view_count INTEGER DEFAULT 0,
  clone_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  fork_count INTEGER DEFAULT 0,
  
  -- File Management
  total_files INTEGER DEFAULT 0,
  total_size_bytes BIGINT DEFAULT 0,
  archive_url TEXT,
  
  -- Collaboration
  is_public BOOLEAN DEFAULT FALSE,
  allow_forks BOOLEAN DEFAULT FALSE,
  allow_comments BOOLEAN DEFAULT TRUE,
  
  -- Audit Trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES public.users(id),
  updated_by UUID REFERENCES public.users(id),
  
  -- Soft Delete
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES public.users(id),
  
  -- Constraints
  CONSTRAINT valid_generation_data CHECK (
    (generation_time_ms IS NULL OR generation_time_ms >= 0) AND
    (generation_cost_cents IS NULL OR generation_cost_cents >= 0) AND
    (generation_tokens_used IS NULL OR generation_tokens_used >= 0)
  ),
  CONSTRAINT valid_counts CHECK (
    view_count >= 0 AND clone_count >= 0 AND 
    like_count >= 0 AND fork_count >= 0
  )
);

-- Auto-generate slug from name
CREATE OR REPLACE FUNCTION generate_project_slug() 
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := LOWER(REGEXP_REPLACE(NEW.name, '[^a-zA-Z0-9]+', '-', 'g'));
    NEW.slug := TRIM(BOTH '-' FROM NEW.slug);
    
    -- Ensure uniqueness within user scope
    WHILE EXISTS (
      SELECT 1 FROM public.projects 
      WHERE user_id = NEW.user_id 
      AND slug = NEW.slug 
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID)
      AND deleted_at IS NULL
    ) LOOP
      NEW.slug := NEW.slug || '-' || SUBSTRING(gen_random_uuid()::TEXT FROM 1 FOR 8);
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_project_slug 
  BEFORE INSERT OR UPDATE ON public.projects 
  FOR EACH ROW EXECUTE FUNCTION generate_project_slug();

-- =============================================
-- ENHANCED TEMPLATES WITH MARKETPLACE FEATURES
-- =============================================

DROP TABLE IF EXISTS public.templates CASCADE;

CREATE TABLE public.templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Basic Information
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  slug TEXT UNIQUE,
  short_description TEXT,
  long_description TEXT,
  
  -- Categorization & Discovery
  category template_category NOT NULL,
  subcategory TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  keywords TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Technical Configuration
  frontend_stack tech_stack NOT NULL,
  backend_stack tech_stack,
  auth_methods auth_method[] DEFAULT ARRAY[]::auth_method[],
  supported_databases TEXT[] DEFAULT ARRAY['postgresql'],
  
  -- Template Content
  file_structure JSONB NOT NULL,
  dependencies JSONB NOT NULL DEFAULT '{}',
  dev_dependencies JSONB DEFAULT '{}',
  environment_variables JSONB DEFAULT '{}',
  scripts JSONB DEFAULT '{}',
  
  -- Documentation & Guides
  readme_content TEXT,
  setup_instructions TEXT,
  deployment_guide TEXT,
  troubleshooting_guide TEXT,
  changelog TEXT,
  
  -- Versioning
  version TEXT DEFAULT '1.0.0',
  previous_version_id UUID REFERENCES public.templates(id),
  is_latest_version BOOLEAN DEFAULT TRUE,
  
  -- Access Control & Monetization
  visibility template_visibility DEFAULT 'public',
  is_premium BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  price_cents INTEGER DEFAULT 0,
  
  -- Ownership & Attribution
  created_by UUID REFERENCES public.users(id),
  team_id UUID REFERENCES public.teams(id),
  license TEXT DEFAULT 'MIT',
  attribution_required BOOLEAN DEFAULT FALSE,
  
  -- Quality & Metrics
  complexity_score INTEGER DEFAULT 1 CHECK (complexity_score BETWEEN 1 AND 5),
  estimated_setup_time_minutes INTEGER DEFAULT 30,
  maintenance_level TEXT DEFAULT 'low' CHECK (maintenance_level IN ('low', 'medium', 'high')),
  
  -- Analytics & Engagement
  usage_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  fork_count INTEGER DEFAULT 0,
  rating_average DECIMAL(3,2) DEFAULT 0.00,
  rating_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  
  -- SEO & Marketing
  seo_title TEXT,
  seo_description TEXT,
  og_image_url TEXT,
  
  -- Moderation & Safety
  is_approved BOOLEAN DEFAULT FALSE,
  approved_by UUID REFERENCES public.users(id),
  approved_at TIMESTAMPTZ,
  moderation_notes TEXT,
  report_count INTEGER DEFAULT 0,
  
  -- Audit Trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  
  -- Soft Delete
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES public.users(id),
  
  -- Constraints
  CONSTRAINT valid_price CHECK (price_cents >= 0),
  CONSTRAINT valid_metrics CHECK (
    usage_count >= 0 AND download_count >= 0 AND 
    fork_count >= 0 AND rating_count >= 0 AND 
    view_count >= 0 AND report_count >= 0
  ),
  CONSTRAINT valid_rating CHECK (rating_average >= 0 AND rating_average <= 5)
);

-- =============================================
-- PROJECT COLLABORATION & PERMISSIONS
-- =============================================

CREATE TABLE public.project_collaborators (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Access Control
  role TEXT DEFAULT 'viewer' CHECK (role IN ('owner', 'editor', 'viewer', 'commenter')),
  permissions JSONB DEFAULT '{}',
  
  -- Invitation Management
  invitation_token TEXT UNIQUE,
  invited_by UUID REFERENCES public.users(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'removed')),
  
  -- Access Tracking
  last_accessed_at TIMESTAMPTZ,
  access_count INTEGER DEFAULT 0,
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(project_id, user_id)
);

-- =============================================
-- COMPREHENSIVE AUDIT & ACTIVITY LOGGING
-- =============================================

CREATE TABLE public.activity_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Actor & Context
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  
  -- Action Details
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  
  -- Metadata
  details JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  
  -- Request Context
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  
  -- Timing
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partition activity_logs by month for performance
CREATE TABLE public.activity_logs_y2024m12 PARTITION OF public.activity_logs
FOR VALUES FROM ('2024-12-01') TO ('2025-01-01');

-- =============================================
-- ENHANCED INDEXES FOR PERFORMANCE
-- =============================================

-- Users table indexes
CREATE INDEX idx_users_email_trgm ON public.users USING gin (email gin_trgm_ops);
CREATE INDEX idx_users_subscription_active ON public.users(subscription_tier, is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_team ON public.users(current_team_id) WHERE current_team_id IS NOT NULL;
CREATE INDEX idx_users_last_seen ON public.users(last_seen_at DESC) WHERE is_active = TRUE;

-- Teams table indexes
CREATE INDEX idx_teams_slug ON public.teams(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_teams_active ON public.teams(is_active, created_at DESC);

-- Projects table indexes
CREATE INDEX idx_projects_user_status ON public.projects(user_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_projects_team ON public.projects(team_id) WHERE team_id IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX idx_projects_public ON public.projects(is_public, created_at DESC) WHERE is_public = TRUE AND deleted_at IS NULL;
CREATE INDEX idx_projects_stack ON public.projects(frontend_stack, backend_stack) WHERE deleted_at IS NULL;
CREATE INDEX idx_projects_search ON public.projects USING gin ((name || ' ' || description) gin_trgm_ops) WHERE deleted_at IS NULL;

-- Templates table indexes
CREATE INDEX idx_templates_category_featured ON public.templates(category, is_featured, rating_average DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_templates_visibility ON public.templates(visibility, is_approved) WHERE deleted_at IS NULL;
CREATE INDEX idx_templates_usage ON public.templates(usage_count DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_templates_search ON public.templates USING gin ((name || ' ' || description) gin_trgm_ops) WHERE deleted_at IS NULL;

-- Activity logs indexes
CREATE INDEX idx_activity_logs_user_action ON public.activity_logs(user_id, action, created_at DESC);
CREATE INDEX idx_activity_logs_resource ON public.activity_logs(resource_type, resource_id, created_at DESC);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at DESC);

-- =============================================
-- COMPREHENSIVE RLS POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- ===== USERS TABLE POLICIES =====

-- Users can view their own profile and public profiles
CREATE POLICY "users_select_own_or_public" ON public.users
  FOR SELECT USING (
    auth.uid() = id OR 
    (is_active = TRUE AND deleted_at IS NULL)
  );

-- Users can only update their own profile
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND deleted_at IS NULL);

-- Only authenticated users can insert (handled by trigger)
CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Soft delete policy - users can only soft delete themselves
CREATE POLICY "users_soft_delete_own" ON public.users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ===== TEAMS TABLE POLICIES =====

-- Team visibility based on membership
CREATE POLICY "teams_select_member_or_public" ON public.teams
  FOR SELECT USING (
    is_active = TRUE AND (
      -- Team members can see their teams
      EXISTS (
        SELECT 1 FROM public.team_members tm
        WHERE tm.team_id = id 
        AND tm.user_id = auth.uid()
        AND tm.status = 'active'
      ) OR
      -- Public teams (if we add this feature)
      (subscription_tier IN ('team_monthly', 'team_yearly') AND is_active = TRUE)
    )
  );

-- Only team owners can update teams
CREATE POLICY "teams_update_owner" ON public.teams
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = id 
      AND tm.user_id = auth.uid()
      AND tm.role = 'owner'
      AND tm.status = 'active'
    )
  );

-- Authenticated users can create teams
CREATE POLICY "teams_insert_authenticated" ON public.teams
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- ===== TEAM MEMBERS POLICIES =====

-- Team members can view other team members
CREATE POLICY "team_members_select_same_team" ON public.team_members
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
    )
  );

-- Only team owners/admins can manage memberships
CREATE POLICY "team_members_manage_by_admin" ON public.team_members
  FOR ALL USING (
    -- Team owners and admins
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('owner', 'admin')
      AND tm.status = 'active'
    ) OR
    -- Users can accept their own invitations
    (user_id = auth.uid() AND status = 'pending')
  );

-- ===== PROJECTS TABLE POLICIES =====

-- Project access based on ownership, collaboration, and visibility
CREATE POLICY "projects_select_access" ON public.projects
  FOR SELECT USING (
    deleted_at IS NULL AND (
      -- Project owner
      user_id = auth.uid() OR
      -- Team member (if project belongs to team)
      (team_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.team_members tm
        WHERE tm.team_id = projects.team_id
        AND tm.user_id = auth.uid()
        AND tm.status = 'active'
      )) OR
      -- Project collaborator
      EXISTS (
        SELECT 1 FROM public.project_collaborators pc
        WHERE pc.project_id = id
        AND pc.user_id = auth.uid()
        AND pc.status = 'active'
      ) OR
      -- Public projects
      (visibility = 'public' AND is_public = TRUE)
    )
  );

-- Project modification by owners and editors
CREATE POLICY "projects_modify_authorized" ON public.projects
  FOR UPDATE USING (
    deleted_at IS NULL AND (
      -- Project owner
      user_id = auth.uid() OR
      -- Team admin/owner (if project belongs to team)
      (team_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.team_members tm
        WHERE tm.team_id = projects.team_id
        AND tm.user_id = auth.uid()
        AND tm.role IN ('owner', 'admin')
        AND tm.status = 'active'
      )) OR
      -- Project editor
      EXISTS (
        SELECT 1 FROM public.project_collaborators pc
        WHERE pc.project_id = id
        AND pc.user_id = auth.uid()
        AND pc.role IN ('owner', 'editor')
        AND pc.status = 'active'
      )
    )
  );

-- Project creation by authenticated users
CREATE POLICY "projects_insert_authenticated" ON public.projects
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    -- If team project, user must be team member
    (team_id IS NULL OR EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = projects.team_id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
    ))
  );

-- ===== TEMPLATES TABLE POLICIES =====

-- Template access based on visibility and subscription
CREATE POLICY "templates_select_access" ON public.templates
  FOR SELECT USING (
    deleted_at IS NULL AND (
      -- Public templates
      visibility = 'public' OR
      -- Premium templates for premium users
      (visibility = 'premium' AND EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.id = auth.uid()
        AND u.subscription_tier IN ('pro_monthly', 'pro_yearly', 'team_monthly', 'team_yearly', 'enterprise')
        AND u.is_active = TRUE
      )) OR
      -- Team templates for team members
      (visibility = 'team' AND team_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.team_members tm
        WHERE tm.team_id = templates.team_id
        AND tm.user_id = auth.uid()
        AND tm.status = 'active'
      )) OR
      -- Private templates for creator
      (visibility = 'private' AND created_by = auth.uid()) OR
      -- Unlisted templates accessible via direct link
      visibility = 'unlisted'
    )
  );

-- Template modification by creators and admins
CREATE POLICY "templates_modify_creator" ON public.templates
  FOR UPDATE USING (
    created_by = auth.uid() OR
    -- Team admins can modify team templates
    (team_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = templates.team_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('owner', 'admin')
      AND tm.status = 'active'
    )) OR
    -- Platform moderators/admins
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
      AND u.role IN ('moderator', 'admin', 'super_admin')
      AND u.is_active = TRUE
    )
  );

-- Template creation by authenticated users
CREATE POLICY "templates_insert_authenticated" ON public.templates
  FOR INSERT WITH CHECK (
    auth.uid() = created_by AND
    -- If team template, user must be team member
    (team_id IS NULL OR EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = templates.team_id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
    ))
  );

-- ===== ACTIVITY LOGS POLICIES =====

-- Users can view their own activity logs
CREATE POLICY "activity_logs_select_own" ON public.activity_logs
  FOR SELECT USING (
    user_id = auth.uid() OR
    -- Team members can view team activity
    (team_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = activity_logs.team_id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
    )) OR
    -- Admins can view all logs
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
      AND u.role IN ('admin', 'super_admin')
      AND u.is_active = TRUE
    )
  );

-- Only service role can insert activity logs
CREATE POLICY "activity_logs_insert_service" ON public.activity_logs
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- =============================================
-- ADVANCED FUNCTIONS & TRIGGERS
-- =============================================

-- Enhanced user update trigger with activity logging
CREATE OR REPLACE FUNCTION handle_user_updates()
RETURNS TRIGGER AS $$
BEGIN
  -- Update timestamp
  NEW.updated_at = NOW();
  NEW.updated_by = auth.uid();
  
  -- Log significant changes
  IF OLD.subscription_tier != NEW.subscription_tier THEN
    INSERT INTO public.activity_logs (user_id, action, resource_type, resource_id, details)
    VALUES (NEW.id, 'subscription_changed', 'user', NEW.id, jsonb_build_object(
      'old_tier', OLD.subscription_tier,
      'new_tier', NEW.subscription_tier
    ));
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER user_updates_trigger
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION handle_user_updates();

-- Project activity tracking
CREATE OR REPLACE FUNCTION handle_project_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.activity_logs (user_id, action, resource_type, resource_id, details)
    VALUES (NEW.user_id, 'project_created', 'project', NEW.id, jsonb_build_object(
      'name', NEW.name,
      'frontend_stack', NEW.frontend_stack,
      'backend_stack', NEW.backend_stack
    ));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Log status changes
    IF OLD.status != NEW.status THEN
      INSERT INTO public.activity_logs (user_id, action, resource_type, resource_id, details)
      VALUES (NEW.user_id, 'project_status_changed', 'project', NEW.id, jsonb_build_object(
        'old_status', OLD.status,
        'new_status', NEW.status
      ));
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER project_activity_trigger
  AFTER INSERT OR UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION handle_project_activity();

-- Template usage tracking
CREATE OR REPLACE FUNCTION increment_template_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.template_id IS NOT NULL THEN
    UPDATE public.templates 
    SET usage_count = usage_count + 1,
        updated_at = NOW()
    WHERE id = NEW.template_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER template_usage_trigger
  AFTER INSERT ON public.projects
  FOR EACH ROW EXECUTE FUNCTION increment_template_usage();

-- =============================================
-- DATA INTEGRITY CONSTRAINTS
-- =============================================

-- Ensure team owners are always team members
CREATE OR REPLACE FUNCTION validate_team_ownership()
RETURNS TRIGGER AS $$
BEGIN
  -- When setting current_team_id, ensure user is a member
  IF NEW.current_team_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = NEW.current_team_id
      AND tm.user_id = NEW.id
      AND tm.status = 'active'
    ) THEN
      RAISE EXCEPTION 'User must be an active team member to set current_team_id';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_team_ownership_trigger
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION validate_team_ownership();

-- =============================================
-- PERFORMANCE OPTIMIZATION FUNCTIONS
-- =============================================

-- Function to clean up old activity logs
CREATE OR REPLACE FUNCTION cleanup_old_activity_logs(retention_days INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.activity_logs 
  WHERE created_at < NOW() - INTERVAL '1 day' * retention_days;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user statistics
CREATE OR REPLACE FUNCTION update_user_statistics(user_uuid UUID DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
  UPDATE public.users 
  SET 
    projects_generated = (
      SELECT COUNT(*) FROM public.projects 
      WHERE user_id = users.id AND deleted_at IS NULL
    ),
    last_seen_at = GREATEST(last_seen_at, NOW() - INTERVAL '1 hour')
  WHERE (user_uuid IS NULL OR id = user_uuid)
  AND is_active = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 