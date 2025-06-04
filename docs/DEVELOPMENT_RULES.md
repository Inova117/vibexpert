# 🚨 **MANDATORY DEVELOPMENT RULES FOR VIBE-BUILDER**
*These rules are NON-NEGOTIABLE and must be followed by all developers*

---

## ⚡ **RULE #1: ABSOLUTE CODE HONESTY**
### **Never claim something is "fixed" unless it's actually working**

```typescript
// ❌ WRONG - Claiming it works without testing
function generateProject(data: any) {
  // TODO: Implement AI generation
  return { success: true, message: "Project generated!" } // LYING!
}

// ✅ CORRECT - Honest implementation status
function generateProject(data: ProjectData): Promise<GenerationResult> {
  throw new Error('AI generation not yet implemented - see issue #42')
  // OR implement it properly with tests
}
```

**ENFORCEMENT:**
- Every function must have working tests before marked as "complete"
- All TODOs must have GitHub issues with deadlines
- Code review requires actual functionality demonstration
- Failed deployments = immediate rollback, no exceptions

---

## 🏗 **RULE #2: MODERN TYPESCRIPT STANDARDS ONLY**
### **Use latest practices, strict typing, no legacy patterns**

```typescript
// ❌ FORBIDDEN - Legacy/loose patterns
export default function Component(props: any) {
  const [data, setData] = useState(null)
  // Missing error handling, loose typing
}

// ✅ REQUIRED - Modern TypeScript patterns
interface ComponentProps {
  readonly userId: string
  readonly onSuccess: (result: GenerationResult) => void
  readonly className?: string
}

export const Component: FC<ComponentProps> = ({ 
  userId, 
  onSuccess, 
  className 
}) => {
  const [data, setData] = useState<GenerationResult | null>(null)
  const [error, setError] = useState<Error | null>(null)
  
  // Proper error boundaries, loading states, etc.
}
```

**STANDARDS:**
- TypeScript strict mode: `"strict": true, "noUncheckedIndexedAccess": true`
- Functional components with proper props interfaces
- Error boundaries for all async operations
- Zod schemas for all external data validation
- React Query for server state management

---

## 🔒 **RULE #3: SECURITY-FIRST DEVELOPMENT**
### **Every feature must pass security review before deployment**

```sql
-- ❌ FORBIDDEN - Unsafe database queries
CREATE POLICY "unsafe_policy" ON projects 
  FOR ALL USING (true); -- DANGEROUS!

-- ✅ REQUIRED - Bulletproof RLS policies
CREATE POLICY "secure_project_access" ON projects
  FOR SELECT USING (
    deleted_at IS NULL AND auth.uid() IS NOT NULL AND (
      user_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM team_members tm
        WHERE tm.team_id = projects.team_id
        AND tm.user_id = auth.uid()
        AND tm.status = 'active'
        AND EXISTS (
          SELECT 1 FROM teams t 
          WHERE t.id = tm.team_id AND t.is_active = TRUE
        )
      )
    )
  );
```

**REQUIREMENTS:**
- All inputs sanitized with Zod validation
- RLS policies tested with multiple user scenarios
- No hardcoded secrets (use environment variables)
- OWASP security checklist for every PR
- Regular dependency vulnerability scans

---

## 🧪 **RULE #4: TEST-DRIVEN DEVELOPMENT (NON-NEGOTIABLE)**
### **No code ships without comprehensive tests**

```typescript
// ❌ FORBIDDEN - Shipping untested code
export function calculateSubscriptionPrice(tier: string) {
  // Complex business logic without tests
  if (tier === 'pro') return 2999
  // What about edge cases? Currency? Discounts?
}

// ✅ REQUIRED - Comprehensive test coverage
describe('calculateSubscriptionPrice', () => {
  test('calculates pro monthly price correctly', () => {
    expect(calculateSubscriptionPrice('pro', 'monthly', 'USD')).toBe(2999)
  })
  
  test('applies annual discount', () => {
    expect(calculateSubscriptionPrice('pro', 'yearly', 'USD')).toBe(28788) // 20% off
  })
  
  test('throws error for invalid tier', () => {
    expect(() => calculateSubscriptionPrice('invalid', 'monthly', 'USD'))
      .toThrow('Invalid subscription tier')
  })
  
  test('handles different currencies', () => {
    expect(calculateSubscriptionPrice('pro', 'monthly', 'EUR')).toBe(2799)
  })
})
```

**COVERAGE REQUIREMENTS:**
- Minimum 80% code coverage (enforced by CI)
- Unit tests for all business logic
- Integration tests for API endpoints
- E2E tests for critical user journeys
- Performance tests for scalability bottlenecks

---

## 📊 **RULE #5: OBSESSIVE PERFORMANCE MONITORING**
### **Every feature must be monitored and optimized**

```typescript
// ❌ FORBIDDEN - No performance consideration
async function generateScaffold(prompt: string) {
  const result = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }]
  })
  return result
}

// ✅ REQUIRED - Performance-aware implementation
async function generateScaffold(prompt: string): Promise<ScaffoldResult> {
  const startTime = performance.now()
  
  try {
    // Implement retry logic with exponential backoff
    const result = await retry(
      () => openai.chat.completions.create({
        model: 'gpt-4-turbo', // Faster model
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 4000, // Limit token usage
        temperature: 0.7
      }),
      { retries: 3, backoff: 'exponential' }
    )
    
    // Log performance metrics
    await logMetric('ai_generation_time', performance.now() - startTime)
    await logMetric('ai_tokens_used', result.usage?.total_tokens || 0)
    
    return parseScaffoldResult(result)
    
  } catch (error) {
    await logError('scaffold_generation_failed', error, { prompt_length: prompt.length })
    throw new ScaffoldGenerationError('Failed to generate scaffold', { cause: error })
  }
}
```

**MONITORING REQUIREMENTS:**
- Real-time performance dashboards
- Automatic alerts for degraded performance
- Database query performance tracking
- API response time monitoring (p95 < 2s)
- Memory usage and leak detection

---

## 🔄 **RULE #6: BULLETPROOF ERROR HANDLING**
### **Every possible failure scenario must be handled gracefully**

```typescript
// ❌ FORBIDDEN - Silent failures or unclear errors
async function deployProject(projectId: string) {
  try {
    const result = await deploymentService.deploy(projectId)
    return result
  } catch (error) {
    console.log('Deployment failed') // USELESS!
    return null // SILENT FAILURE!
  }
}

// ✅ REQUIRED - Comprehensive error handling
interface DeploymentError extends Error {
  readonly code: string
  readonly retryable: boolean
  readonly userMessage: string
  readonly metadata?: Record<string, unknown>
}

async function deployProject(projectId: string): Promise<DeploymentResult> {
  try {
    // Validate input
    if (!projectId || !isValidUUID(projectId)) {
      throw new DeploymentError('Invalid project ID', {
        code: 'INVALID_PROJECT_ID',
        retryable: false,
        userMessage: 'Please refresh the page and try again.'
      })
    }
    
    // Check prerequisites
    const project = await getProject(projectId)
    if (project.status !== 'generated') {
      throw new DeploymentError('Project not ready for deployment', {
        code: 'PROJECT_NOT_READY',
        retryable: false,
        userMessage: 'Please generate your project first before deploying.'
      })
    }
    
    const result = await deploymentService.deploy(projectId)
    
    // Log success metrics
    await logActivity(project.user_id, 'deployment_successful', {
      project_id: projectId,
      deployment_url: result.url
    })
    
    return result
    
  } catch (error) {
    // Structured error logging
    await logError('deployment_failed', error, {
      project_id: projectId,
      user_id: project?.user_id,
      error_code: error.code,
      retryable: error.retryable
    })
    
    // Re-throw with context for UI handling
    throw error
  }
}
```

**ERROR HANDLING STANDARDS:**
- All async operations wrapped in try-catch
- Structured error objects with codes and user messages
- Automatic error reporting to monitoring system
- Graceful fallbacks for non-critical features
- User-friendly error messages (no technical jargon)

---

## 🗃 **RULE #7: DATABASE INTEGRITY IS SACRED**
### **Never compromise data consistency or write inefficient queries**

```sql
-- ❌ FORBIDDEN - Dangerous operations
BEGIN;
DELETE FROM users WHERE subscription_tier = 'free'; -- NO BACKUP!
COMMIT;

-- Missing indexes on frequently queried columns
SELECT * FROM projects WHERE user_id = $1; -- SLOW!

-- ✅ REQUIRED - Safe database operations
BEGIN;

-- Always soft delete with audit trail
UPDATE users SET 
  deleted_at = NOW(),
  deleted_by = $1,
  deletion_reason = $2
WHERE subscription_tier = 'free' 
  AND last_seen_at < NOW() - INTERVAL '365 days'
  AND id NOT IN (SELECT DISTINCT user_id FROM projects WHERE deleted_at IS NULL);

-- Log the operation
INSERT INTO audit_logs (action, affected_table, affected_count, performed_by)
VALUES ('bulk_user_cleanup', 'users', ROW_COUNT, $1);

COMMIT;

-- Optimized queries with proper indexes
-- Index: CREATE INDEX CONCURRENTLY idx_projects_user_active ON projects(user_id) WHERE deleted_at IS NULL;
SELECT p.id, p.name, p.status, p.created_at
FROM projects p
WHERE p.user_id = $1 
  AND p.deleted_at IS NULL
ORDER BY p.created_at DESC
LIMIT 20;
```

**DATABASE STANDARDS:**
- All migrations reversible with rollback scripts
- Foreign key constraints on all relationships
- Proper indexes for all query patterns
- Row-level security on all sensitive tables
- Regular backup verification and restore testing

---

## 🔐 **RULE #8: ZERO-TRUST ARCHITECTURE**
### **Validate everything, trust nothing, audit all access**

```typescript
// ❌ FORBIDDEN - Trusting client data
app.post('/api/projects', async (req, res) => {
  const project = await createProject(req.body) // DANGEROUS!
  res.json(project)
})

// ✅ REQUIRED - Zero-trust validation
const CreateProjectSchema = z.object({
  name: z.string().min(2).max(100).regex(/^[a-zA-Z0-9\s\-_]+$/),
  description: z.string().min(10).max(500),
  frontend_stack: z.enum(['react_typescript', 'vue_typescript', 'svelte_typescript']),
  backend_stack: z.enum(['nodejs', 'python', 'go']).optional(),
  template_id: z.string().uuid().optional()
})

app.post('/api/projects', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    // 1. Validate request body
    const validatedData = CreateProjectSchema.parse(req.body)
    
    // 2. Check user permissions and limits
    const user = await getCurrentUser(req.userId)
    if (!user.is_active) {
      throw new ForbiddenError('Account suspended')
    }
    
    if (user.monthly_generations >= user.monthly_limit) {
      throw new LimitExceededError('Monthly generation limit reached')
    }
    
    // 3. Validate template access (if specified)
    if (validatedData.template_id) {
      const hasAccess = await checkTemplateAccess(req.userId, validatedData.template_id)
      if (!hasAccess) {
        throw new ForbiddenError('Template access denied')
      }
    }
    
    // 4. Create project with audit trail
    const project = await createProject({
      ...validatedData,
      user_id: req.userId,
      created_by: req.userId,
      ip_address: req.ip,
      user_agent: req.headers['user-agent']
    })
    
    // 5. Log successful action
    await logActivity(req.userId, 'project_created', {
      project_id: project.id,
      template_used: validatedData.template_id
    })
    
    res.json({ success: true, data: project })
    
  } catch (error) {
    await logSecurityEvent('project_creation_failed', {
      user_id: req.userId,
      error: error.message,
      ip_address: req.ip
    })
    
    handleApiError(error, res)
  }
})
```

**SECURITY REQUIREMENTS:**
- Authentication on all protected endpoints
- Input validation with Zod schemas
- Rate limiting per user and IP
- Audit logging for all state changes
- Regular security penetration testing

---

## 📱 **RULE #9: MOBILE-FIRST RESPONSIVE DESIGN**
### **Every component must work perfectly on all devices**

```typescript
// ❌ FORBIDDEN - Desktop-only thinking
const ProjectCard = ({ project }: Props) => (
  <div className="w-[800px] h-[600px] fixed-size"> {/* BREAKS ON MOBILE! */}
    <button className="text-xs">Edit Project</button> {/* TOO SMALL! */}
  </div>
)

// ✅ REQUIRED - Mobile-first responsive design
const ProjectCard = ({ project }: Props) => (
  <div className="
    w-full max-w-sm mx-auto 
    sm:max-w-md md:max-w-lg lg:max-w-xl
    bg-white dark:bg-gray-800
    rounded-lg shadow-sm hover:shadow-md
    transition-all duration-200
    touch-manipulation
  ">
    <div className="p-4 sm:p-6">
      <h3 className="
        text-lg sm:text-xl font-semibold
        text-gray-900 dark:text-white
        line-clamp-2
      ">
        {project.name}
      </h3>
      
      <p className="
        mt-2 text-sm sm:text-base
        text-gray-600 dark:text-gray-300
        line-clamp-3
      ">
        {project.description}
      </p>
      
      <div className="mt-4 flex flex-col sm:flex-row gap-2">
        <Button 
          size="sm"
          className="w-full sm:w-auto min-h-[44px]" // Touch-friendly
          onClick={() => editProject(project.id)}
        >
          Edit Project
        </Button>
        
        <Button 
          variant="outline"
          size="sm"
          className="w-full sm:w-auto min-h-[44px]"
          onClick={() => exportProject(project.id)}
        >
          Export
        </Button>
      </div>
    </div>
  </div>
)
```

**RESPONSIVE STANDARDS:**
- Mobile-first CSS approach (min-width media queries)
- Touch targets minimum 44px × 44px
- Readable text on all screen sizes (min 16px)
- Fast loading on slow connections (< 3s)
- Offline capability for core features

---

## 🚀 **RULE #10: FUTURE-PROOF ARCHITECTURE**
### **Build for scale, plan for change, document everything**

```typescript
// ❌ FORBIDDEN - Hardcoded, inflexible architecture
class ProjectGenerator {
  async generate(prompt: string) {
    // Hardcoded to OpenAI only
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${OPENAI_KEY}` },
      body: JSON.stringify({ model: 'gpt-4', messages: [{ role: 'user', content: prompt }] })
    })
    return response.json()
  }
}

// ✅ REQUIRED - Flexible, extensible architecture
interface AIProvider {
  readonly name: string
  readonly models: readonly string[]
  generateScaffold(prompt: string, options: GenerationOptions): Promise<ScaffoldResult>
  estimateCost(prompt: string, model: string): Promise<number>
}

class OpenAIProvider implements AIProvider {
  readonly name = 'openai'
  readonly models = ['gpt-4-turbo', 'gpt-3.5-turbo'] as const
  
  async generateScaffold(prompt: string, options: GenerationOptions): Promise<ScaffoldResult> {
    // Implementation with retry logic, error handling, etc.
  }
}

class ClaudeProvider implements AIProvider {
  readonly name = 'anthropic'
  readonly models = ['claude-3-sonnet', 'claude-3-haiku'] as const
  
  async generateScaffold(prompt: string, options: GenerationOptions): Promise<ScaffoldResult> {
    // Alternative implementation
  }
}

class AIProviderManager {
  private providers = new Map<string, AIProvider>()
  
  constructor() {
    this.registerProvider(new OpenAIProvider())
    this.registerProvider(new ClaudeProvider())
  }
  
  registerProvider(provider: AIProvider): void {
    this.providers.set(provider.name, provider)
  }
  
  async generateWithFallback(
    prompt: string, 
    options: GenerationOptions
  ): Promise<ScaffoldResult> {
    const primaryProvider = this.providers.get(options.preferredProvider)
    
    try {
      return await primaryProvider.generateScaffold(prompt, options)
    } catch (error) {
      // Automatic fallback to alternative providers
      for (const [name, provider] of this.providers) {
        if (name !== options.preferredProvider) {
          try {
            return await provider.generateScaffold(prompt, options)
          } catch (fallbackError) {
            console.warn(`Fallback provider ${name} failed:`, fallbackError)
          }
        }
      }
      throw new Error('All AI providers failed')
    }
  }
}
```

**FUTURE-PROOFING REQUIREMENTS:**
- Abstract interfaces for all external services
- Configuration-driven feature flags
- Database schema migration strategy
- API versioning from day one
- Comprehensive documentation (ADRs, API docs, deployment guides)
- Regular architecture reviews and tech debt assessments

---

## 🎯 **ENFORCEMENT & ACCOUNTABILITY**

### **Code Review Checklist**
Every PR must pass this checklist:

- [ ] **Security**: RLS policies tested, inputs validated, no secrets exposed
- [ ] **Performance**: Queries optimized, response times measured, caching implemented
- [ ] **Testing**: 80%+ coverage, E2E tests for user flows, error scenarios covered
- [ ] **Documentation**: Functions documented, breaking changes noted, ADRs updated
- [ ] **Mobile**: Responsive design tested, touch-friendly, fast loading
- [ ] **Error Handling**: All failures handled gracefully, user-friendly messages
- [ ] **Monitoring**: Metrics added, alerts configured, logging implemented
- [ ] **TypeScript**: Strict typing, modern patterns, no any types
- [ ] **Architecture**: Follows established patterns, properly abstracted, scalable

### **Violation Consequences**
- **First violation**: Code review feedback and mentoring
- **Second violation**: Pair programming session with senior developer
- **Third violation**: Formal training and performance review
- **Repeated violations**: Project removal from developer responsibilities

### **Success Metrics**
- Zero security vulnerabilities in production
- 99.9% uptime with <2s response times
- User satisfaction score >4.5/5
- Developer productivity improvements
- Technical debt ratio <10%

---

## 🏆 **CONCLUSION**

These rules are not suggestions—they are **mandatory requirements** for building a production-ready, enterprise-grade platform that can scale to millions of users without technical debt or security vulnerabilities.

**Remember: It's better to build slowly and correctly than quickly and broken.**

Every shortcut today becomes technical debt tomorrow. Follow these rules religiously, and Vibe-Builder will be a bulletproof platform that competitors can't touch.

---

**🚀 Build with integrity. Ship with confidence. Scale without limits.** 