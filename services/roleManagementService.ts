'use server'

import type { SupabaseClient } from '@/lib/supabase/server'
import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'
import { getUserId } from '@/services/userService'
import { ERole, roleToString } from '@/types'

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Retrieves the authenticated user's ID using the provided Supabase client.
 * This function verifies user authentication and is used as a prerequisite for other operations.
 *
 * @async
 * @param {SupabaseClient} client - The Supabase client instance configured for server-side operations.
 * @returns {Promise<string>} A promise that resolves to the authenticated user's ID.
 * @throws {Error} Will throw an error if fetching the user fails, indicating an authentication issue.
 */
async function checkAuthUserId(client: SupabaseClient): Promise<string> {
  const { data: user, error } = await client.auth.getUser()
  if (error) {
    console.error('Error fetching user:', error)
    throw new Error('Vous n\'êtes pas autorisé à accéder à cette page')
  }
  return user.user.id
}

/**
 * Retrieves the school ID associated with the director user.
 * This function assumes the user is a director and fetches their associated school ID from the database.
 * It also verifies that the user has the DIRECTOR role.
 *
 * @async
 * @param {SupabaseClient} client - The Supabase client instance configured for server-side operations.
 * @param {string} userId - The authenticated user's ID.
 * @returns {Promise<string>} A promise that resolves to the director's school ID.
 * @throws {Error}
 *  - Will throw an error if the user is not a director.
 *  - Will throw an error if there is an issue fetching the school ID from the database.
 *  - Will throw an error if the user is not associated with any school.
 */
async function getDirectorSchoolId(client: SupabaseClient, userId: string): Promise<{ schoolId: string, schoolName: string, schoolCode: string }> {
  const { data: userSchool, error } = await client
    .from('users')
    .select('school: schools!users_school_id_foreign(id, name, code), user_roles(role_id)')
    .eq('id', userId)
    .eq('user_roles.role_id', ERole.DIRECTOR)
    .single()
  if (error || !userSchool?.school) {
    console.error('Error fetching user school:', error)
    throw new Error('Seul un directeur peut accéder à cette page')
  }
  return {
    schoolId: userSchool.school.id,
    schoolName: userSchool.school.name,
    schoolCode: userSchool.school.code,
  }
}

export interface SchoolMember {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  fullName: string
  avatarUrl: string | null
  roles: ERole[]
  primaryRole: ERole | null
  createdAt: string
  lastActiveAt: string | null
}

export interface InvitationRequest {
  email: string
  role: ERole
  schoolId: string
}

export interface InvitationResult {
  success: boolean
  message: string
  otp?: string
  userExists: boolean
}

/**
 * Generate a secure 6-digit OTP
 */
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Get school members with non-parent and non-teacher roles
 */
export async function getSchoolMembers(schoolId: string, _schoolYearId: number): Promise<SchoolMember[]> {
  const supabase = await createClient()
  const currentUserId = await getUserId()

  if (!currentUserId) {
    throw new Error('Authentication required')
  }

  // First, verify the current user has director access to this school
  const { data: currentUserRole } = await supabase
    .from('users')
    .select('school_id, user_roles(role_id)')
    .eq('id', currentUserId)
    .single()

  if (currentUserRole?.school_id !== schoolId) {
    throw new Error('Unauthorized: You can only manage users in your school')
  }

  const hasDirectorRole = currentUserRole?.user_roles?.some(
    (ur: any) => ur.role_id === ERole.DIRECTOR,
  )

  if (!hasDirectorRole) {
    throw new Error('Unauthorized: Director role required')
  }

  // Get all users in the school with their roles, then filter out users with ONLY parent/teacher roles
  const { data: allMembers, error } = await supabase
    .from('users')
    .select(`
      id,
      email,
      first_name,
      last_name,
      avatar_url,
      created_at,
      updated_at,
      user_roles(role_id)
    `)
    .eq('school_id', schoolId)

  if (error) {
    throw new Error(`Failed to fetch school members: ${error.message}`)
  }

  // Filter out users who only have PARENT or TEACHER roles
  const relevantMembers = allMembers?.filter((member) => {
    const roles = member.user_roles?.map((ur: any) => ur.role_id as ERole) || []
    // Include users who have at least one role that isn't PARENT or TEACHER
    return roles.some(role => role !== ERole.PARENT && role !== ERole.TEACHER)
  }) || []

  // Transform the data to match our interface
  const transformedMembers: SchoolMember[] = relevantMembers.map((member) => {
    const roles = Array.from(new Set(member.user_roles.map((ur: any) => ur.role_id as ERole)))
    const primaryRole = roles.includes(ERole.DIRECTOR) ? ERole.DIRECTOR : roles[0] || null

    return {
      id: member.id,
      email: member.email,
      firstName: member.first_name,
      lastName: member.last_name,
      fullName: `${member.first_name || ''} ${member.last_name || ''}`.trim() || member.email,
      avatarUrl: member.avatar_url,
      roles,
      primaryRole,
      createdAt: member.created_at || new Date().toISOString(),
      lastActiveAt: member.updated_at,
    }
  }) || []

  return transformedMembers
}

/**
 * Send invitation email using Resend
 */
async function sendInvitationEmail(
  email: string,
  otp: string,
  schoolName: string,
  schoolCode: string,
  userExists: boolean,
  role: ERole,
): Promise<void> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yeko-pro.com'
  const roleText = roleToString(role)

  const subject = `Invitation à rejoindre ${schoolName} sur Yeko Pro`

  const htmlContent = userExists
    ? `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2563eb; margin: 0;">Yeko Pro</h1>
        <p style="color: #6b7280; margin: 5px 0 0 0;">Système de Gestion Scolaire</p>
      </div>
      
      <div style="background-color: #f8fafc; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #1f2937; margin-top: 0;">Invitation à rejoindre une école</h2>
        
        <p style="color: #374151; line-height: 1.6;">
          Bonjour,<br><br>
          Vous avez été invité(e) à rejoindre <strong>${schoolName}</strong> (${schoolCode}) sur Yeko Pro avec le rôle de <strong>${roleText}</strong>.
        </p>
        
        <div style="background-color: #dbeafe; padding: 20px; border-radius: 6px; margin: 20px 0; text-align: center;">
          <p style="color: #1e40af; font-weight: bold; margin: 0 0 10px 0; font-size: 18px;">Votre code OTP:</p>
          <p style="color: #1e40af; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 0; font-family: monospace;">${otp}</p>
        </div>
        
        <p style="color: #374151; line-height: 1.6;">
          <strong>Instructions:</strong><br>
          1. Connectez-vous à votre compte Yeko Pro<br>
          2. Communiquez ce code OTP au directeur de l'école<br>
          3. Il pourra alors vous ajouter à son école
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${siteUrl}/sign-in" style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">Se connecter à Yeko Pro</a>
        </div>
      </div>
      
      <div style="text-align: center; color: #6b7280; font-size: 14px;">
        <p>Ce code expire dans 3 minutes.</p>
        <p>Si vous n'avez pas demandé cette invitation, vous pouvez ignorer ce message.</p>
      </div>
    </div>
    `
    : `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2563eb; margin: 0;">Yeko Pro</h1>
        <p style="color: #6b7280; margin: 5px 0 0 0;">Système de Gestion Scolaire</p>
      </div>
      
      <div style="background-color: #f8fafc; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #1f2937; margin-top: 0;">Invitation à rejoindre une école</h2>
        
        <p style="color: #374151; line-height: 1.6;">
          Bonjour,<br><br>
          Vous avez été invité(e) à rejoindre <strong>${schoolName}</strong> (${schoolCode}) sur Yeko Pro avec le rôle de <strong>${roleText}</strong>.
        </p>
        
        <div style="background-color: #fef3c7; padding: 20px; border-radius: 6px; margin: 20px 0;">
          <p style="color: #92400e; font-weight: bold; margin: 0 0 10px 0;">⚠️ Compte non trouvé</p>
          <p style="color: #92400e; margin: 0;">
            Vous n'avez pas encore de compte Yeko Pro. Veuillez d'abord créer un compte.
          </p>
        </div>
        
        <div style="background-color: #dbeafe; padding: 20px; border-radius: 6px; margin: 20px 0; text-align: center;">
          <p style="color: #1e40af; font-weight: bold; margin: 0 0 10px 0; font-size: 18px;">Votre code OTP:</p>
          <p style="color: #1e40af; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 0; font-family: monospace;">${otp}</p>
        </div>
        
        <p style="color: #374151; line-height: 1.6;">
          <strong>Instructions:</strong><br>
          1. Créez d'abord un compte sur Yeko Pro<br>
          2. Une fois connecté, communiquez ce code OTP au directeur de l'école<br>
          3. Il pourra alors vous ajouter à son école
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${siteUrl}/sign-up" style="background-color: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-right: 10px;">Créer un compte</a>
          <a href="${siteUrl}/sign-in" style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">Se connecter</a>
        </div>
      </div>
      
      <div style="text-align: center; color: #6b7280; font-size: 14px;">
        <p>Ce code expire dans 3 minutes.</p>
        <p>Si vous n'avez pas demandé cette invitation, vous pouvez ignorer ce message.</p>
      </div>
    </div>
    `

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@yeko-pro.com',
      to: email,
      subject,
      html: htmlContent,
    })
  }
  catch (error) {
    console.error('Failed to send invitation email:', error)
    throw new Error('Failed to send invitation email')
  }
}

/**
 * Invite a new user to the school
 */
export async function inviteUserToSchool(request: InvitationRequest): Promise<InvitationResult> {
  const supabase = await createClient()
  const userId = await checkAuthUserId(supabase)
  const { schoolId, schoolName, schoolCode } = await getDirectorSchoolId(supabase, userId)

  // Check if user exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('id, email, school_id')
    .eq('email', request.email.toLowerCase())
    .single()

  const userExists = !!existingUser

  // If user exists and is already in this school, return error
  if (userExists && existingUser.school_id === schoolId) {
    return {
      success: false,
      message: 'Cet utilisateur fait déjà partie de cette école',
      userExists,
    }
  }

  // Generate OTP (expiry will be set by database default: 3 minutes)
  const otp = generateOTP()

  // Save invitation to database
  const { error: inviteError } = await supabase
    .from('invite_to_school')
    .insert({
      school_id: schoolId,
      otp,
      created_by: userId,
      is_used: false,
      email: request.email.toLowerCase(),
      use_for: request.role.toString(), // Store the intended role
    })

  if (inviteError) {
    throw new Error(`Failed to create invitation: ${inviteError.message}`)
  }

  // Send email
  try {
    await sendInvitationEmail(
      request.email,
      otp,
      schoolName,
      schoolCode,
      userExists,
      request.role,
    )

    return {
      success: true,
      message: userExists
        ? 'Invitation envoyée! L\'utilisateur recevra le code OTP par email.'
        : 'Invitation envoyée! L\'utilisateur devra d\'abord créer un compte, puis utiliser le code OTP.',
      // otp, // Return OTP for display to the director
      userExists,
    }
  }
  catch (error) {
    console.error('Email sending failed:', error)

    // Clean up the invitation if email failed
    await supabase
      .from('invite_to_school')
      .delete()
      .eq('otp', otp)

    return {
      success: false,
      message: 'Erreur lors de l\'envoi de l\'email. Veuillez réessayer.',
      userExists,
    }
  }
}

/**
 * Validate OTP and add user to school
 */
export async function validateOTPAndAddUser(
  otp: string,
  // userEmail: string,
): Promise<{ success: boolean, message: string }> {
  const supabase = await createClient()
  await checkAuthUserId(supabase)

  // Find the invitation
  const { data: invitation, error: inviteError } = await supabase
    .from('invite_to_school')
    .select('id, school_id, email, use_for, expired_at')
    .eq('otp', otp)
    .eq('is_used', false)
    .neq('email', null)
    .neq('use_for', null)
    .single()

  if (inviteError || !invitation) {
    return {
      success: false,
      message: 'Code OTP invalide ou expiré',
    }
  }

  // Check if expired
  if (new Date() > new Date(invitation.expired_at)) {
    return {
      success: false,
      message: 'Ce code OTP a expiré',
    }
  }

  // Find the user by email
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('email', invitation.email!.toLowerCase())
    .single()

  if (userError || !user) {
    return {
      success: false,
      message: 'Utilisateur non trouvé. Assurez-vous que l\'utilisateur a créé un compte.',
    }
  }

  try {
    // Start transaction-like operations

    // // 1. Update user's school
    // const { error: updateUserError } = await supabase
    //   .from('users')
    //   .update({ school_id: invitation.school_id })
    //   .eq('id', user.id)

    // if (updateUserError) {
    //   throw new Error(`Failed to update user school: ${updateUserError.message}`)
    // }

    // 2. Add user role (use the role stored in the invitation)
    const roleToAssign = invitation.use_for ? Number.parseInt(invitation.use_for, 10) : ERole.DIRECTOR
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: user.id,
        role_id: roleToAssign,
      })

    if (roleError) {
      throw new Error(`Failed to assign role: ${roleError.message}`)
    }

    // 3. Mark invitation as used
    const { error: markUsedError } = await supabase
      .from('invite_to_school')
      .update({ is_used: true })
      .eq('id', invitation.id)

    if (markUsedError) {
      throw new Error(`Failed to mark invitation as used: ${markUsedError.message}`)
    }

    return {
      success: true,
      message: 'Utilisateur ajouté avec succès à l\'école!',
    }
  }
  catch (error) {
    console.error('Error adding user to school:', error)
    return {
      success: false,
      message: 'Erreur lors de l\'ajout de l\'utilisateur. Veuillez réessayer.',
    }
  }
}

/**
 * Update user role in school
 */
export async function updateUserRole(
  userId: string,
  newRole: ERole,
  schoolId: string,
): Promise<{ success: boolean, message: string }> {
  const supabase = await createClient()
  const currentUserId = await getUserId()

  if (!currentUserId) {
    throw new Error('Authentication required')
  }

  // Verify current user has director access
  const { data: currentUser } = await supabase
    .from('users')
    .select('school_id, user_roles(role_id)')
    .eq('id', currentUserId)
    .single()

  if (currentUser?.school_id !== schoolId) {
    throw new Error('Unauthorized')
  }

  const hasDirectorRole = currentUser?.user_roles?.some(
    (ur: any) => ur.role_id === ERole.DIRECTOR,
  )

  if (!hasDirectorRole) {
    throw new Error('Unauthorized: Director role required')
  }

  // Don't allow removing the last director
  if (newRole !== ERole.DIRECTOR) {
    const { data: directors } = await supabase
      .from('users')
      .select('id, user_roles!inner(role_id)')
      .eq('school_id', schoolId)
      .eq('user_roles.role_id', ERole.DIRECTOR)

    if (directors && directors.length <= 1 && directors[0].id === userId) {
      return {
        success: false,
        message: 'Impossible de retirer le dernier directeur de l\'école',
      }
    }
  }

  try {
    // Remove existing roles for this user
    const { error: deleteError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)

    if (deleteError) {
      throw new Error(`Failed to remove existing roles: ${deleteError.message}`)
    }

    // Add new role
    const { error: insertError } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role_id: newRole,
      })

    if (insertError) {
      throw new Error(`Failed to assign new role: ${insertError.message}`)
    }

    return {
      success: true,
      message: 'Rôle mis à jour avec succès!',
    }
  }
  catch (error) {
    console.error('Error updating user role:', error)
    return {
      success: false,
      message: 'Erreur lors de la mise à jour du rôle',
    }
  }
}

/**
 * Remove user from school
 */
export async function removeUserFromSchool(
  userId: string,
  schoolId: string,
): Promise<{ success: boolean, message: string }> {
  const supabase = await createClient()
  const currentUserId = await getUserId()

  if (!currentUserId) {
    throw new Error('Authentication required')
  }

  // Don't allow removing yourself
  if (userId === currentUserId) {
    return {
      success: false,
      message: 'Vous ne pouvez pas vous retirer vous-même de l\'école',
    }
  }

  // Verify current user has director access
  const { data: currentUser } = await supabase
    .from('users')
    .select('school_id, user_roles(role_id)')
    .eq('id', currentUserId)
    .single()

  if (currentUser?.school_id !== schoolId) {
    throw new Error('Unauthorized')
  }

  const hasDirectorRole = currentUser?.user_roles?.some(
    (ur: any) => ur.role_id === ERole.DIRECTOR,
  )

  if (!hasDirectorRole) {
    throw new Error('Unauthorized: Director role required')
  }

  // Check if this is the last director
  const { data: directors } = await supabase
    .from('users')
    .select('id, user_roles!inner(role_id)')
    .eq('school_id', schoolId)
    .eq('user_roles.role_id', ERole.DIRECTOR)

  const userIsDirector = directors?.some(d => d.id === userId)

  if (userIsDirector && directors && directors.length <= 1) {
    return {
      success: false,
      message: 'Impossible de retirer le dernier directeur de l\'école',
    }
  }

  try {
    // Remove user roles
    const { error: deleteRolesError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)

    if (deleteRolesError) {
      throw new Error(`Failed to remove user roles: ${deleteRolesError.message}`)
    }

    // Remove user from school
    const { error: updateUserError } = await supabase
      .from('users')
      .update({ school_id: null })
      .eq('id', userId)

    if (updateUserError) {
      throw new Error(`Failed to remove user from school: ${updateUserError.message}`)
    }

    return {
      success: true,
      message: 'Utilisateur retiré de l\'école avec succès!',
    }
  }
  catch (error) {
    console.error('Error removing user from school:', error)
    return {
      success: false,
      message: 'Erreur lors du retrait de l\'utilisateur',
    }
  }
}
