# 🏗 Vibe-Builder Infrastructure Documentation

## 📋 **System Architecture Overview**

Vibe-Builder is built on a modern, scalable architecture designed for rapid development and production deployment:

### **Frontend Architecture**
- **React 18** with TypeScript for type-safe development
- **Vite** for lightning-fast builds and hot reloading
- **Tailwind CSS + Shadcn/UI** for consistent, accessible design
- **TanStack Query** for server state management and caching
- **React Router** for client-side routing

### **Backend Architecture**
- **Supabase** as the primary backend-as-a-service
- **PostgreSQL** with Row Level Security (RLS) for data protection
- **Edge Functions** (Deno runtime) for serverless API endpoints
- **Real-time subscriptions** for live updates
- **Authentication** with multiple OAuth providers

### **AI Integration**
- **OpenAI GPT-4** for intelligent scaffold generation
- **Context-aware prompts** for optimized code generation
- **Fallback mechanisms** for reliability

---

## 🗄 **Database Schema**

### **Core Tables**

```sql
-- Users (extends Supabase auth.users)
users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  subscription_tier subscription_tier DEFAULT 'free',
  projects_generated INTEGER DEFAULT 0,
  monthly_generations INTEGER DEFAULT 0,
  preferences JSONB
)

-- Project scaffolds
projects (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name TEXT,
  description TEXT,
  status project_status DEFAULT 'draft',
  frontend_stack tech_stack,
  backend_stack tech_stack,
  file_structure JSONB,
  database_schema JSONB,
  api_endpoints JSONB
)

-- Scaffold templates
templates (
  id UUID PRIMARY KEY,
  name TEXT,
  category template_category,
  frontend_stack tech_stack,
  file_structure JSONB,
  dependencies JSONB,
  is_premium BOOLEAN DEFAULT FALSE
)
```

### **Security Features**
- **Row Level Security (RLS)** on all tables
- **User-based access control** 
- **Subscription tier validation**
- **Usage limits and tracking**

---

## 🔧 **API Endpoints (Edge Functions)**

### **Core Functions**

#### 1. **Generate Scaffold** (`/functions/generate-scaffold`)
- **Purpose**: AI-powered project scaffold generation
- **Input**: App idea, tech stack preferences, template ID
- **Output**: Complete project structure, DB schema, API endpoints
- **Features**: 
  - OpenAI integration
  - Usage limit enforcement
  - Analytics tracking

#### 2. **Manage Projects** (`/functions/manage-projects`)
- **Purpose**: CRUD operations for user projects
- **Methods**: GET, POST, PUT, DELETE
- **Features**:
  - Project ownership validation
  - Collaborative access control
  - Export functionality

#### 3. **Template Library** (`/functions/templates`)
- **Purpose**: Template management and marketplace
- **Features**:
  - Public template browsing
  - Premium template access
  - Community contributions

---

## 🚀 **Deployment Architecture**

### **Development Environment**
```bash
# Local Supabase stack
supabase start

# Frontend development server
npm run dev

# Edge functions development
supabase functions serve
```

### **Production Deployment**

#### **Frontend** (Vercel/Netlify)
- Automatic deployments from Git
- Edge CDN distribution
- Environment variable management
- Preview deployments for PRs

#### **Backend** (Supabase Cloud)
- Managed PostgreSQL database
- Global edge function deployment
- Authentication provider management
- Real-time infrastructure

---

## ⚙️ **Environment Configuration**

### **Required Environment Variables**

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Services
OPENAI_API_KEY=your_openai_api_key

# OAuth Providers
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret

# Payments (Optional)
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
```

---

## 🔒 **Security Implementation**

### **Authentication & Authorization**
- Multi-provider OAuth (Google, GitHub)
- Email/password authentication
- JWT token management
- Session security

### **Data Protection**
- Row Level Security (RLS) policies
- User data isolation
- Encrypted data transmission
- Input validation and sanitization

### **API Security**
- Rate limiting on all endpoints
- CORS configuration
- Request authentication
- Error handling without data leakage

---

## 📊 **Monitoring & Analytics**

### **Application Metrics**
- User registration and engagement
- Project generation success rates
- API response times
- Error rates and types

### **Business Metrics**
- Subscription conversions
- Feature usage patterns
- Template popularity
- User retention rates

---

## 🛠 **Development Workflow**

### **Setup Process**
1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd vibe-builder
   ```

2. **Run setup script**
   ```bash
   npm run setup
   ```

3. **Configure environment**
   ```bash
   # Update .env.local with your values
   ```

4. **Start development**
   ```bash
   npm run supabase:start
   npm run dev
   ```

### **Database Management**
```bash
# Reset database
npm run supabase:reset

# Push migrations
npm run supabase:migrate

# Generate TypeScript types
npm run supabase:generate-types
```

### **Deployment Process**
```bash
# Build for production
npm run build

# Deploy to Supabase
supabase db push --linked
supabase functions deploy

# Deploy frontend (automatic via Git)
git push origin main
```

---

## 🔄 **CI/CD Pipeline**

### **Automated Testing**
- TypeScript compilation
- ESLint code quality checks
- Unit tests for critical functions
- Integration tests for API endpoints

### **Deployment Automation**
- Automatic preview deployments
- Database migration validation
- Environment variable verification
- Rollback mechanisms

---

## 📈 **Scaling Considerations**

### **Database Optimization**
- Connection pooling
- Query optimization
- Index management
- Caching strategies

### **API Performance**
- Edge function optimization
- Response caching
- Rate limiting
- Load balancing

### **Frontend Performance**
- Code splitting
- Image optimization
- Bundle analysis
- Performance monitoring

---

## 🔧 **Troubleshooting Guide**

### **Common Issues**

#### **Supabase Connection**
```bash
# Check Supabase status
npm run supabase:status

# Restart services
npm run supabase:stop
npm run supabase:start
```

#### **Authentication Issues**
- Verify OAuth provider configuration
- Check redirect URL settings
- Validate JWT token expiration

#### **Database Problems**
- Check RLS policies
- Verify user permissions
- Review migration status

---

## 📚 **Additional Resources**

- [Supabase Documentation](https://supabase.com/docs)
- [React Query Guide](https://tanstack.com/query/latest)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [OpenAI API Reference](https://platform.openai.com/docs)

---

**This infrastructure is designed to scale from prototype to production with minimal configuration changes.** 