import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface TemplateSearchParams {
  category?: string
  frontend_stack?: string
  backend_stack?: string
  tags?: string[]
  search?: string
  visibility?: string
  sort_by?: 'created_at' | 'usage_count' | 'rating_average'
  sort_order?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const url = new URL(req.url)
    const templateId = url.searchParams.get('id')

    // Authentication (optional for browsing public templates)
    const authHeader = req.headers.get('Authorization')
    let user = null
    let userRole = 'anonymous'

    if (authHeader) {
      const { data: { user: authUser }, error } = await supabase.auth.getUser(
        authHeader.replace('Bearer ', '')
      )
      if (!error && authUser) {
        user = authUser
        const { data: userData } = await supabase
          .from('users')
          .select('role, subscription_tier, is_active')
          .eq('id', user.id)
          .single()
        
        if (userData && userData.is_active) {
          userRole = userData.role
        }
      }
    }

    switch (req.method) {
      case 'GET':
        if (templateId) {
          return await handleGetTemplate(supabase, templateId, user)
        } else {
          const searchParams = extractSearchParams(url)
          return await handleSearchTemplates(supabase, searchParams, user)
        }
      
      case 'POST':
        if (!user) {
          return new Response(
            JSON.stringify({ error: 'Authentication required' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        const createData = await req.json()
        return await handleCreateTemplate(supabase, user.id, createData)
      
      case 'PUT':
        if (!user || !templateId) {
          return new Response(
            JSON.stringify({ error: 'Authentication and template ID required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        const updateData = await req.json()
        return await handleUpdateTemplate(supabase, user.id, templateId, updateData)
      
      case 'DELETE':
        if (!user || !templateId) {
          return new Response(
            JSON.stringify({ error: 'Authentication and template ID required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        return await handleDeleteTemplate(supabase, user.id, templateId)
      
      default:
        return new Response(
          JSON.stringify({ error: 'Method not allowed' }),
          { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

  } catch (error) {
    console.error('Template marketplace error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function extractSearchParams(url: URL): TemplateSearchParams {
  return {
    category: url.searchParams.get('category') || undefined,
    frontend_stack: url.searchParams.get('frontend_stack') || undefined,
    backend_stack: url.searchParams.get('backend_stack') || undefined,
    tags: url.searchParams.get('tags')?.split(',') || undefined,
    search: url.searchParams.get('search') || undefined,
    visibility: url.searchParams.get('visibility') || undefined,
    sort_by: (url.searchParams.get('sort_by') as any) || 'created_at',
    sort_order: (url.searchParams.get('sort_order') as any) || 'desc',
    limit: parseInt(url.searchParams.get('limit') || '20'),
    offset: parseInt(url.searchParams.get('offset') || '0')
  }
}

async function handleSearchTemplates(supabase: any, params: TemplateSearchParams, user: any) {
  try {
    let query = supabase
      .from('templates')
      .select(`
        id,
        name,
        description,
        short_description,
        slug,
        category,
        subcategory,
        tags,
        keywords,
        frontend_stack,
        backend_stack,
        auth_methods,
        visibility,
        is_premium,
        is_featured,
        is_verified,
        price_cents,
        version,
        usage_count,
        download_count,
        rating_average,
        rating_count,
        view_count,
        complexity_score,
        estimated_setup_time_minutes,
        maintenance_level,
        seo_title,
        og_image_url,
        created_at,
        updated_at,
        published_at,
        created_by:users!templates_created_by_fkey(display_name, avatar_url),
        team:teams(name, slug)
      `)
      .eq('deleted_at', null)
      .eq('is_approved', true)

    // Apply visibility filters based on user access
    if (!user) {
      query = query.eq('visibility', 'public')
    } else {
      // Get user's subscription tier to check premium access
      const { data: userData } = await supabase
        .from('users')
        .select('subscription_tier, current_team_id')
        .eq('id', user.id)
        .single()

      const hasPremiumAccess = userData?.subscription_tier && 
        ['pro_monthly', 'pro_yearly', 'team_monthly', 'team_yearly', 'enterprise'].includes(userData.subscription_tier)

      if (hasPremiumAccess) {
        query = query.in('visibility', ['public', 'premium', 'unlisted'])
      } else {
        query = query.in('visibility', ['public', 'unlisted'])
      }

      // Add user's private templates
      query = query.or(`created_by.eq.${user.id}`)

      // Add team templates if user is in a team
      if (userData?.current_team_id) {
        query = query.or(`team_id.eq.${userData.current_team_id}`)
      }
    }

    // Apply search filters
    if (params.category) {
      query = query.eq('category', params.category)
    }

    if (params.frontend_stack) {
      query = query.eq('frontend_stack', params.frontend_stack)
    }

    if (params.backend_stack) {
      query = query.eq('backend_stack', params.backend_stack)
    }

    if (params.tags && params.tags.length > 0) {
      query = query.overlaps('tags', params.tags)
    }

    if (params.search) {
      query = query.or(`name.ilike.%${params.search}%,description.ilike.%${params.search}%,tags.cs.{${params.search}}`)
    }

    if (params.visibility && user) {
      query = query.eq('visibility', params.visibility)
    }

    // Apply sorting
    const sortColumn = params.sort_by || 'created_at'
    const sortOrder = params.sort_order === 'asc' ? { ascending: true } : { ascending: false }
    query = query.order(sortColumn, sortOrder)

    // Apply pagination
    if (params.offset) {
      query = query.range(params.offset, params.offset + (params.limit || 20) - 1)
    } else {
      query = query.limit(params.limit || 20)
    }

    const { data: templates, error, count } = await query

    if (error) throw error

    // Get filter aggregations for faceted search
    const { data: categories } = await supabase
      .from('templates')
      .select('category')
      .eq('deleted_at', null)
      .eq('is_approved', true)

    const { data: stacks } = await supabase
      .from('templates')
      .select('frontend_stack, backend_stack')
      .eq('deleted_at', null)
      .eq('is_approved', true)

    // Log search analytics
    if (user) {
      await supabase
        .from('activity_logs')
        .insert({
          user_id: user.id,
          action: 'template_search',
          resource_type: 'template',
          details: {
            search_params: params,
            results_count: templates?.length || 0
          }
        })
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          templates,
          pagination: {
            offset: params.offset || 0,
            limit: params.limit || 20,
            total: count
          },
          facets: {
            categories: [...new Set(categories?.map(c => c.category))],
            frontend_stacks: [...new Set(stacks?.map(s => s.frontend_stack))],
            backend_stacks: [...new Set(stacks?.map(s => s.backend_stack).filter(Boolean))]
          }
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Template search error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to search templates' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

async function handleGetTemplate(supabase: any, templateId: string, user: any) {
  try {
    const { data: template, error } = await supabase
      .from('templates')
      .select(`
        *,
        created_by:users!templates_created_by_fkey(id, display_name, avatar_url, github_username),
        team:teams(name, slug, description),
        ratings:template_ratings(rating, review, created_at, user:users(display_name, avatar_url))
      `)
      .eq('id', templateId)
      .eq('deleted_at', null)
      .single()

    if (error) throw error
    if (!template) {
      return new Response(
        JSON.stringify({ error: 'Template not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check access permissions
    const hasAccess = await checkTemplateAccess(supabase, template, user)
    if (!hasAccess) {
      return new Response(
        JSON.stringify({ error: 'Access denied' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Increment view count
    await supabase
      .from('templates')
      .update({ view_count: template.view_count + 1 })
      .eq('id', templateId)

    // Log view analytics
    if (user) {
      await supabase
        .from('activity_logs')
        .insert({
          user_id: user.id,
          action: 'template_viewed',
          resource_type: 'template',
          resource_id: templateId,
          details: {
            template_name: template.name,
            template_category: template.category
          }
        })
    }

    return new Response(
      JSON.stringify({ success: true, data: template }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Get template error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to fetch template' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

async function checkTemplateAccess(supabase: any, template: any, user: any): Promise<boolean> {
  // Public templates are always accessible
  if (template.visibility === 'public' || template.visibility === 'unlisted') {
    return true
  }

  // Must be authenticated for non-public templates
  if (!user) return false

  // Creator always has access
  if (template.created_by === user.id) return true

  // Check premium access
  if (template.visibility === 'premium') {
    const { data: userData } = await supabase
      .from('users')
      .select('subscription_tier')
      .eq('id', user.id)
      .single()

    return userData?.subscription_tier && 
      ['pro_monthly', 'pro_yearly', 'team_monthly', 'team_yearly', 'enterprise'].includes(userData.subscription_tier)
  }

  // Check team access
  if (template.visibility === 'team' && template.team_id) {
    const { data: membership } = await supabase
      .from('team_members')
      .select('status')
      .eq('team_id', template.team_id)
      .eq('user_id', user.id)
      .single()

    return membership?.status === 'active'
  }

  return false
}

async function handleCreateTemplate(supabase: any, userId: string, templateData: any) {
  try {
    // Validate required fields
    const requiredFields = ['name', 'description', 'category', 'frontend_stack', 'file_structure']
    for (const field of requiredFields) {
      if (!templateData[field]) {
        return new Response(
          JSON.stringify({ error: `Missing required field: ${field}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Generate slug from name
    const slug = templateData.name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const { data: template, error } = await supabase
      .from('templates')
      .insert({
        ...templateData,
        slug,
        created_by: userId,
        visibility: templateData.visibility || 'private',
        is_approved: false // Requires moderation
      })
      .select()
      .single()

    if (error) throw error

    // Log creation
    await supabase
      .from('activity_logs')
      .insert({
        user_id: userId,
        action: 'template_created',
        resource_type: 'template',
        resource_id: template.id,
        details: {
          name: template.name,
          category: template.category,
          visibility: template.visibility
        }
      })

    return new Response(
      JSON.stringify({ success: true, data: template }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Create template error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to create template' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

async function handleUpdateTemplate(supabase: any, userId: string, templateId: string, updateData: any) {
  try {
    // Verify ownership or admin rights
    const { data: template } = await supabase
      .from('templates')
      .select('created_by, team_id')
      .eq('id', templateId)
      .single()

    if (!template) {
      return new Response(
        JSON.stringify({ error: 'Template not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const hasPermission = template.created_by === userId || 
      await checkTeamAdminAccess(supabase, template.team_id, userId)

    if (!hasPermission) {
      return new Response(
        JSON.stringify({ error: 'Permission denied' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: updatedTemplate, error } = await supabase
      .from('templates')
      .update(updateData)
      .eq('id', templateId)
      .select()
      .single()

    if (error) throw error

    return new Response(
      JSON.stringify({ success: true, data: updatedTemplate }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Update template error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to update template' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

async function handleDeleteTemplate(supabase: any, userId: string, templateId: string) {
  try {
    // Soft delete the template
    const { error } = await supabase
      .from('templates')
      .update({ 
        deleted_at: new Date().toISOString(),
        deleted_by: userId 
      })
      .eq('id', templateId)
      .eq('created_by', userId) // Ensure ownership

    if (error) throw error

    return new Response(
      JSON.stringify({ success: true, message: 'Template deleted successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Delete template error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to delete template' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

async function checkTeamAdminAccess(supabase: any, teamId: string, userId: string): Promise<boolean> {
  if (!teamId) return false

  const { data: membership } = await supabase
    .from('team_members')
    .select('role, status')
    .eq('team_id', teamId)
    .eq('user_id', userId)
    .single()

  return membership?.status === 'active' && 
    ['owner', 'admin'].includes(membership.role)
} 