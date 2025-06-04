import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const url = new URL(req.url)
    const projectId = url.searchParams.get('id')

    switch (req.method) {
      case 'GET':
        return await handleGetProjects(supabase, user.id, projectId)
      
      case 'POST':
        const createData = await req.json()
        return await handleCreateProject(supabase, user.id, createData)
      
      case 'PUT':
        if (!projectId) {
          return new Response(
            JSON.stringify({ error: 'Project ID required for update' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        const updateData = await req.json()
        return await handleUpdateProject(supabase, user.id, projectId, updateData)
      
      case 'DELETE':
        if (!projectId) {
          return new Response(
            JSON.stringify({ error: 'Project ID required for deletion' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        return await handleDeleteProject(supabase, user.id, projectId)
      
      default:
        return new Response(
          JSON.stringify({ error: 'Method not allowed' }),
          { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

  } catch (error) {
    console.error('Project management error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function handleGetProjects(supabase: any, userId: string, projectId?: string) {
  try {
    let query = supabase
      .from('projects')
      .select(`
        *,
        template:templates(name, description, category)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (projectId) {
      query = query.eq('id', projectId).single()
    }

    const { data, error } = await query

    if (error) throw error

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to fetch projects' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

async function handleCreateProject(supabase: any, userId: string, projectData: any) {
  try {
    const { data, error } = await supabase
      .from('projects')
      .insert({
        ...projectData,
        user_id: userId,
        status: 'draft'
      })
      .select()
      .single()

    if (error) throw error

    // Log analytics
    await supabase
      .from('usage_analytics')
      .insert({
        user_id: userId,
        event_type: 'project_created',
        event_data: {
          project_id: data.id,
          frontend_stack: projectData.frontend_stack,
          backend_stack: projectData.backend_stack
        }
      })

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to create project' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

async function handleUpdateProject(supabase: any, userId: string, projectId: string, updateData: any) {
  try {
    // Verify ownership
    const { data: existingProject } = await supabase
      .from('projects')
      .select('user_id')
      .eq('id', projectId)
      .single()

    if (!existingProject || existingProject.user_id !== userId) {
      return new Response(
        JSON.stringify({ error: 'Project not found or access denied' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', projectId)
      .select()
      .single()

    if (error) throw error

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to update project' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

async function handleDeleteProject(supabase: any, userId: string, projectId: string) {
  try {
    // Verify ownership
    const { data: existingProject } = await supabase
      .from('projects')
      .select('user_id')
      .eq('id', projectId)
      .single()

    if (!existingProject || existingProject.user_id !== userId) {
      return new Response(
        JSON.stringify({ error: 'Project not found or access denied' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)

    if (error) throw error

    return new Response(
      JSON.stringify({ success: true, message: 'Project deleted successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to delete project' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
} 