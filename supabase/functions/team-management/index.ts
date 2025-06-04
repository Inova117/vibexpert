import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface TeamCreateRequest {
  name: string
  slug?: string
  description?: string
  subscription_tier?: string
}

interface TeamInviteRequest {
  email: string
  role: 'admin' | 'member' | 'guest'
  message?: string
}

interface TeamUpdateRequest {
  name?: string
  description?: string
  avatar_url?: string
  allow_member_invites?: boolean
  require_admin_approval?: boolean
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Authentication required for all team operations
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify user is active
    const { data: userData } = await supabase
      .from('users')
      .select('is_active, subscription_tier')
      .eq('id', user.id)
      .single()

    if (!userData?.is_active) {
      return new Response(
        JSON.stringify({ error: 'Account suspended' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const url = new URL(req.url)
    const teamId = url.searchParams.get('team_id')
    const memberId = url.searchParams.get('member_id')
    const inviteToken = url.searchParams.get('invite_token')
    const endpoint = url.pathname.split('/').pop()

    switch (req.method) {
      case 'GET':
        if (inviteToken) {
          return await handleGetInvitation(supabase, inviteToken)
        } else if (teamId && memberId) {
          return await handleGetMember(supabase, user.id, teamId, memberId)
        } else if (teamId) {
          return await handleGetTeam(supabase, user.id, teamId)
        } else {
          return await handleGetUserTeams(supabase, user.id)
        }
      
      case 'POST':
        if (endpoint === 'invite') {
          if (!teamId) {
            return new Response(
              JSON.stringify({ error: 'Team ID required for invitations' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
          const inviteData = await req.json()
          return await handleInviteMember(supabase, user.id, teamId, inviteData)
        } else if (endpoint === 'accept-invite') {
          if (!inviteToken) {
            return new Response(
              JSON.stringify({ error: 'Invite token required' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
          return await handleAcceptInvitation(supabase, user.id, inviteToken)
        } else {
          const teamData = await req.json()
          return await handleCreateTeam(supabase, user.id, teamData, userData.subscription_tier)
        }
      
      case 'PUT':
        if (teamId && memberId) {
          const memberUpdate = await req.json()
          return await handleUpdateMember(supabase, user.id, teamId, memberId, memberUpdate)
        } else if (teamId) {
          const teamUpdate = await req.json()
          return await handleUpdateTeam(supabase, user.id, teamId, teamUpdate)
        }
        break
      
      case 'DELETE':
        if (teamId && memberId) {
          return await handleRemoveMember(supabase, user.id, teamId, memberId)
        } else if (teamId) {
          return await handleDeleteTeam(supabase, user.id, teamId)
        }
        break
      
      default:
        return new Response(
          JSON.stringify({ error: 'Method not allowed' }),
          { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid request' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Team management error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function handleCreateTeam(supabase: any, userId: string, teamData: TeamCreateRequest, userTier: string) {
  try {
    // Validate team creation permissions
    if (!['pro_monthly', 'pro_yearly', 'team_monthly', 'team_yearly', 'enterprise'].includes(userTier)) {
      return new Response(
        JSON.stringify({ 
          error: 'Team features require a Pro or Team subscription',
          upgrade_required: true 
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate required fields
    if (!teamData.name || teamData.name.trim().length < 2) {
      return new Response(
        JSON.stringify({ error: 'Team name must be at least 2 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate slug if not provided
    let slug = teamData.slug || teamData.name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Ensure slug uniqueness
    let slugExists = true
    let counter = 0
    while (slugExists) {
      const testSlug = counter > 0 ? `${slug}-${counter}` : slug
      const { data: existing } = await supabase
        .from('teams')
        .select('id')
        .eq('slug', testSlug)
        .single()
      
      if (!existing) {
        slug = testSlug
        slugExists = false
      } else {
        counter++
      }
    }

    // Create team with transaction
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert({
        name: teamData.name.trim(),
        slug,
        description: teamData.description?.trim() || null,
        subscription_tier: teamData.subscription_tier || 'team_monthly',
        created_by: userId
      })
      .select()
      .single()

    if (teamError) throw teamError

    // Add creator as team owner
    const { error: memberError } = await supabase
      .from('team_members')
      .insert({
        team_id: team.id,
        user_id: userId,
        role: 'owner',
        status: 'active',
        accepted_at: new Date().toISOString()
      })

    if (memberError) throw memberError

    // Update user's current team
    await supabase
      .from('users')
      .update({ 
        current_team_id: team.id,
        is_team_owner: true 
      })
      .eq('id', userId)

    // Log team creation
    await supabase
      .from('activity_logs')
      .insert({
        user_id: userId,
        team_id: team.id,
        action: 'team_created',
        resource_type: 'team',
        resource_id: team.id,
        details: {
          team_name: team.name,
          team_slug: team.slug
        }
      })

    return new Response(
      JSON.stringify({ success: true, data: team }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Create team error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to create team' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

async function handleGetUserTeams(supabase: any, userId: string) {
  try {
    const { data: teams, error } = await supabase
      .from('team_members')
      .select(`
        role,
        status,
        joined_at: accepted_at,
        team:teams(
          id,
          name,
          slug,
          description,
          avatar_url,
          subscription_tier,
          member_limit,
          project_limit,
          current_projects,
          is_active,
          created_at
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('accepted_at', { ascending: false })

    if (error) throw error

    return new Response(
      JSON.stringify({ success: true, data: teams }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Get user teams error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to fetch teams' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

async function handleGetTeam(supabase: any, userId: string, teamId: string) {
  try {
    // Verify team access
    const { data: membership } = await supabase
      .from('team_members')
      .select('role, status')
      .eq('team_id', teamId)
      .eq('user_id', userId)
      .single()

    if (!membership || membership.status !== 'active') {
      return new Response(
        JSON.stringify({ error: 'Team not found or access denied' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get team details with members
    const { data: team, error } = await supabase
      .from('teams')
      .select(`
        *,
        members:team_members(
          id,
          role,
          status,
          invited_at,
          accepted_at,
          user:users(
            id,
            display_name,
            avatar_url,
            email
          )
        ),
        projects:projects(
          id,
          name,
          status,
          created_at
        )
      `)
      .eq('id', teamId)
      .single()

    if (error) throw error

    // Filter member details based on role permissions
    if (membership.role === 'guest') {
      team.members = team.members.filter((m: any) => m.user.id === userId)
    }

    return new Response(
      JSON.stringify({ success: true, data: team }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Get team error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to fetch team' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

async function handleInviteMember(supabase: any, userId: string, teamId: string, inviteData: TeamInviteRequest) {
  try {
    // Verify team admin permissions
    const { data: membership } = await supabase
      .from('team_members')
      .select('role, status')
      .eq('team_id', teamId)
      .eq('user_id', userId)
      .single()

    if (!membership || membership.status !== 'active' || !['owner', 'admin'].includes(membership.role)) {
      return new Response(
        JSON.stringify({ error: 'Permission denied' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(inviteData.email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email address' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', inviteData.email)
      .single()

    // Check if user is already a team member
    if (existingUser) {
      const { data: existingMember } = await supabase
        .from('team_members')
        .select('status')
        .eq('team_id', teamId)
        .eq('user_id', existingUser.id)
        .single()

      if (existingMember) {
        return new Response(
          JSON.stringify({ 
            error: existingMember.status === 'active' 
              ? 'User is already a team member' 
              : 'User has a pending invitation' 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Generate invitation token
    const inviteToken = crypto.randomUUID()

    // Create invitation record
    const { data: invitation, error: inviteError } = await supabase
      .from('team_members')
      .insert({
        team_id: teamId,
        user_id: existingUser?.id || null,
        role: inviteData.role,
        status: 'pending',
        invitation_token: inviteToken,
        invited_by: userId
      })
      .select(`
        *,
        team:teams(name, slug),
        inviter:users!team_members_invited_by_fkey(display_name)
      `)
      .single()

    if (inviteError) throw inviteError

    // TODO: Send invitation email
    // await sendInvitationEmail(inviteData.email, invitation, inviteData.message)

    // Log invitation
    await supabase
      .from('activity_logs')
      .insert({
        user_id: userId,
        team_id: teamId,
        action: 'member_invited',
        resource_type: 'team_member',
        details: {
          invited_email: inviteData.email,
          invited_role: inviteData.role,
          existing_user: !!existingUser
        }
      })

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: invitation,
        invite_url: `${Deno.env.get('FRONTEND_URL')}/team/invite?token=${inviteToken}`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Invite member error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to send invitation' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

async function handleAcceptInvitation(supabase: any, userId: string, inviteToken: string) {
  try {
    // Find invitation
    const { data: invitation, error: inviteError } = await supabase
      .from('team_members')
      .select(`
        *,
        team:teams(name, slug, member_limit, current_members:team_members(count))
      `)
      .eq('invitation_token', inviteToken)
      .eq('status', 'pending')
      .single()

    if (inviteError || !invitation) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired invitation' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if invitation is for this user (email-based or user-specific)
    if (invitation.user_id && invitation.user_id !== userId) {
      return new Response(
        JSON.stringify({ error: 'This invitation is not for your account' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check team member limits
    const currentMemberCount = invitation.team.current_members[0]?.count || 0
    if (currentMemberCount >= invitation.team.member_limit) {
      return new Response(
        JSON.stringify({ error: 'Team has reached member limit' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Accept invitation
    const { error: updateError } = await supabase
      .from('team_members')
      .update({
        user_id: userId,
        status: 'active',
        accepted_at: new Date().toISOString(),
        invitation_token: null // Clear token after use
      })
      .eq('id', invitation.id)

    if (updateError) throw updateError

    // Update user's current team if they don't have one
    const { data: userData } = await supabase
      .from('users')
      .select('current_team_id')
      .eq('id', userId)
      .single()

    if (!userData?.current_team_id) {
      await supabase
        .from('users')
        .update({ current_team_id: invitation.team_id })
        .eq('id', userId)
    }

    // Log acceptance
    await supabase
      .from('activity_logs')
      .insert({
        user_id: userId,
        team_id: invitation.team_id,
        action: 'invitation_accepted',
        resource_type: 'team_member',
        details: {
          role: invitation.role,
          team_name: invitation.team.name
        }
      })

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully joined ${invitation.team.name}`,
        team: invitation.team
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Accept invitation error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to accept invitation' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

async function handleUpdateMember(supabase: any, userId: string, teamId: string, memberId: string, updateData: any) {
  try {
    // Verify admin permissions
    const { data: adminMembership } = await supabase
      .from('team_members')
      .select('role, status')
      .eq('team_id', teamId)
      .eq('user_id', userId)
      .single()

    if (!adminMembership || adminMembership.status !== 'active' || !['owner', 'admin'].includes(adminMembership.role)) {
      return new Response(
        JSON.stringify({ error: 'Permission denied' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Prevent non-owners from modifying owners
    const { data: targetMember } = await supabase
      .from('team_members')
      .select('role, user_id')
      .eq('id', memberId)
      .eq('team_id', teamId)
      .single()

    if (!targetMember) {
      return new Response(
        JSON.stringify({ error: 'Member not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (targetMember.role === 'owner' && adminMembership.role !== 'owner') {
      return new Response(
        JSON.stringify({ error: 'Only team owners can modify owner permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update member
    const { data: updatedMember, error } = await supabase
      .from('team_members')
      .update(updateData)
      .eq('id', memberId)
      .select()
      .single()

    if (error) throw error

    return new Response(
      JSON.stringify({ success: true, data: updatedMember }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Update member error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to update member' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

async function handleGetInvitation(supabase: any, inviteToken: string) {
  try {
    const { data: invitation, error } = await supabase
      .from('team_members')
      .select(`
        role,
        status,
        invited_at,
        team:teams(name, slug, description, avatar_url),
        inviter:users!team_members_invited_by_fkey(display_name, avatar_url)
      `)
      .eq('invitation_token', inviteToken)
      .eq('status', 'pending')
      .single()

    if (error || !invitation) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired invitation' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, data: invitation }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Get invitation error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to fetch invitation' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
} 