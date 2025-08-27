import type { NextRequest } from 'next/server'
import type { GoogleProfile } from '@/types'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ERole } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const { userId, userMetadata } = await request.json()

    if (!userId || !userMetadata) {
      return NextResponse.json(
        { error: 'Missing userId or userMetadata' },
        { status: 400 },
      )
    }

    const supabase = await createClient()

    // Verify the requesting user is authenticated and matches the userId
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user || user.id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      )
    }

    const googleProfile = userMetadata as GoogleProfile

    // Create user profile
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: googleProfile.email,
        first_name: googleProfile.given_name || googleProfile.name?.split(' ')[0] || '',
        last_name: googleProfile.family_name || googleProfile.name?.split(' ').slice(1).join(' ') || '',
        avatar_url: googleProfile.picture,
        email_verified: googleProfile.email_verified,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      return NextResponse.json(
        { error: 'Failed to create user profile' },
        { status: 500 },
      )
    }

    // Assign default role (PARENT) to new OAuth users
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role_id: ERole.PARENT,
        created_at: new Date().toISOString(),
      })

    if (roleError) {
      console.warn('Role assignment failed:', roleError)
      // Don't fail the entire operation if role assignment fails
    }

    return NextResponse.json({ success: true })
  }
  catch (error) {
    console.error('Error in create-user API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
