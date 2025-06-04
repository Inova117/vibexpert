import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface GenerateScaffoldRequest {
  appIdea: string
  frontendStack: string
  backendStack: string
  authType: string
  templateId?: string
}

interface FileStructure {
  [key: string]: string[] | FileStructure
}

interface GeneratedScaffold {
  projectStructure: FileStructure
  databaseSchema: any[]
  apiEndpoints: any[]
  environmentVariables: Record<string, string>
  dependencies: Record<string, string>
  deploymentConfig: any
  securityRecommendations: string[]
}

const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get('Authorization')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    })

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check user subscription and usage limits
    const { data: userData } = await supabase
      .from('users')
      .select('subscription_tier, monthly_generations, projects_generated')
      .eq('id', user.id)
      .single()

    if (!userData) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check generation limits
    const limits = {
      free: 3,
      pro: 50,
      team: 100,
      enterprise: -1 // unlimited
    }

    const userLimit = limits[userData.subscription_tier as keyof typeof limits]
    if (userLimit !== -1 && userData.monthly_generations >= userLimit) {
      return new Response(
        JSON.stringify({ 
          error: 'Monthly generation limit reached',
          limit: userLimit,
          current: userData.monthly_generations
        }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse request body
    const body: GenerateScaffoldRequest = await req.json()
    const { appIdea, frontendStack, backendStack, authType, templateId } = body

    // Validate required fields
    if (!appIdea || !frontendStack) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: appIdea, frontendStack' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const startTime = Date.now()

    // Generate scaffold using AI
    const scaffold = await generateScaffoldWithAI({
      appIdea,
      frontendStack,
      backendStack,
      authType,
      templateId
    }, supabase)

    const generationTime = Date.now() - startTime

    // Create project record
    const projectName = generateProjectName(appIdea)
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        template_id: templateId,
        name: projectName,
        description: appIdea,
        frontend_stack: frontendStack,
        backend_stack: backendStack,
        auth_method: authType,
        file_structure: scaffold.projectStructure,
        database_schema: scaffold.databaseSchema,
        api_endpoints: scaffold.apiEndpoints,
        deployment_config: scaffold.deploymentConfig,
        original_prompt: appIdea,
        ai_model_used: 'gpt-4-turbo',
        generation_time_ms: generationTime,
        status: 'generated'
      })
      .select()
      .single()

    if (projectError) {
      console.error('Project creation error:', projectError)
      return new Response(
        JSON.stringify({ error: 'Failed to save project' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Update user generation count
    await supabase
      .from('users')
      .update({ 
        monthly_generations: userData.monthly_generations + 1,
        projects_generated: userData.projects_generated + 1
      })
      .eq('id', user.id)

    // Log analytics event
    await supabase
      .from('usage_analytics')
      .insert({
        user_id: user.id,
        event_type: 'scaffold_generated',
        event_data: {
          frontend_stack: frontendStack,
          backend_stack: backendStack,
          auth_type: authType,
          generation_time_ms: generationTime,
          project_id: project.id
        },
        ip_address: req.headers.get('x-forwarded-for'),
        user_agent: req.headers.get('user-agent')
      })

    return new Response(
      JSON.stringify({
        success: true,
        project: project,
        scaffold: scaffold,
        generationTime: generationTime
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Generate scaffold error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function generateScaffoldWithAI(
  params: GenerateScaffoldRequest,
  supabase: any
): Promise<GeneratedScaffold> {
  const { appIdea, frontendStack, backendStack, authType, templateId } = params

  // Get template if specified
  let baseTemplate = null
  if (templateId) {
    const { data } = await supabase
      .from('templates')
      .select('*')
      .eq('id', templateId)
      .single()
    baseTemplate = data
  }

  // Create comprehensive prompt for AI
  const prompt = `Generate a complete, production-ready project scaffold for the following application:

**App Description:** ${appIdea}

**Technology Stack:**
- Frontend: ${frontendStack}
- Backend: ${backendStack || 'None specified'}
- Authentication: ${authType || 'None specified'}

**Requirements:**
1. Create a complete file/folder structure optimized for the chosen stack
2. Generate database schema with proper relationships and indexes
3. Define API endpoints with proper REST conventions
4. Include security best practices and RLS policies
5. Add environment variables configuration
6. Provide deployment configuration
7. Include comprehensive dependency list

**Base Template:** ${baseTemplate ? JSON.stringify(baseTemplate.file_structure) : 'None'}

**Output Format:** Return a JSON object with the following structure:
{
  "projectStructure": {}, // Complete file/folder tree
  "databaseSchema": [], // Array of table definitions
  "apiEndpoints": [], // Array of API endpoint definitions  
  "environmentVariables": {}, // Required env vars
  "dependencies": {}, // Package dependencies
  "deploymentConfig": {}, // Deployment settings
  "securityRecommendations": [] // Security best practices
}

Make sure the structure follows modern conventions for ${frontendStack} and includes:
- Proper TypeScript configuration
- ESLint and Prettier setup
- Testing framework setup
- CI/CD pipeline configuration
- Docker configuration for production
- Security headers and CORS setup
- Error handling and logging
- Performance optimizations

Focus on production-ready, scalable architecture with proper separation of concerns.`

  // Call OpenAI API
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured')
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert software architect who creates production-ready project scaffolds. Always return valid JSON that matches the requested schema exactly.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 4000,
      temperature: 0.3,
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`)
  }

  const data = await response.json()
  const aiResponse = data.choices[0].message.content

  try {
    const scaffold = JSON.parse(aiResponse)
    
    // Add default structure if AI response is incomplete
    const defaultScaffold: GeneratedScaffold = {
      projectStructure: scaffold.projectStructure || generateDefaultStructure(frontendStack, backendStack),
      databaseSchema: scaffold.databaseSchema || [],
      apiEndpoints: scaffold.apiEndpoints || [],
      environmentVariables: scaffold.environmentVariables || generateDefaultEnvVars(frontendStack, backendStack),
      dependencies: scaffold.dependencies || generateDefaultDependencies(frontendStack, backendStack),
      deploymentConfig: scaffold.deploymentConfig || generateDefaultDeployment(frontendStack),
      securityRecommendations: scaffold.securityRecommendations || generateDefaultSecurity()
    }

    return defaultScaffold
  } catch (parseError) {
    console.error('Failed to parse AI response:', parseError)
    // Fallback to default structure
    return {
      projectStructure: generateDefaultStructure(frontendStack, backendStack),
      databaseSchema: [],
      apiEndpoints: [],
      environmentVariables: generateDefaultEnvVars(frontendStack, backendStack),
      dependencies: generateDefaultDependencies(frontendStack, backendStack),
      deploymentConfig: generateDefaultDeployment(frontendStack),
      securityRecommendations: generateDefaultSecurity()
    }
  }
}

function generateProjectName(appIdea: string): string {
  const words = appIdea.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(' ')
    .filter(word => word.length > 3)
    .slice(0, 3)
  
  return words.join('-') || 'my-app'
}

function generateDefaultStructure(frontend: string, backend?: string): FileStructure {
  const structure: FileStructure = {
    src: {
      components: ['ui', 'layout', 'forms'],
      pages: ['Home.tsx', 'About.tsx'],
      hooks: ['useAuth.ts', 'useApi.ts'],
      lib: ['utils.ts', 'constants.ts'],
      types: ['index.ts']
    },
    public: ['favicon.ico', 'manifest.json'],
    docs: ['README.md', 'DEPLOYMENT.md']
  }

  if (backend === 'supabase') {
    structure.supabase = {
      migrations: ['001_initial.sql'],
      functions: ['api-handler']
    }
  }

  return structure
}

function generateDefaultEnvVars(frontend: string, backend?: string): Record<string, string> {
  const envVars: Record<string, string> = {
    NODE_ENV: 'development',
    VITE_APP_NAME: 'My App'
  }

  if (backend === 'supabase') {
    envVars.VITE_SUPABASE_URL = 'your_supabase_url'
    envVars.VITE_SUPABASE_ANON_KEY = 'your_supabase_anon_key'
  }

  return envVars
}

function generateDefaultDependencies(frontend: string, backend?: string): Record<string, string> {
  const deps: Record<string, string> = {
    react: '^18.2.0',
    'react-dom': '^18.2.0',
    typescript: '^5.0.0'
  }

  if (frontend.includes('nextjs')) {
    deps.next = '^14.0.0'
  }

  if (backend === 'supabase') {
    deps['@supabase/supabase-js'] = '^2.38.0'
  }

  return deps
}

function generateDefaultDeployment(frontend: string): any {
  return {
    platform: 'vercel',
    buildCommand: 'npm run build',
    outputDirectory: 'dist',
    nodeVersion: '18.x'
  }
}

function generateDefaultSecurity(): string[] {
  return [
    'Enable Row Level Security (RLS) on all database tables',
    'Use environment variables for all secrets and API keys',
    'Implement proper input validation and sanitization',
    'Add CORS headers and CSP policies',
    'Use HTTPS in production',
    'Implement rate limiting on API endpoints',
    'Regular security audits and dependency updates'
  ]
} 