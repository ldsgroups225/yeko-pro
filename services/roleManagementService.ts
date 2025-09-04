'use server'

import type { SchoolMember } from '@/lib/services/schoolService'
import { createAuthorizationService } from '@/lib/services/authorizationService'
import { createEmailService } from '@/lib/services/emailService'
import { createSchoolService } from '@/lib/services/schoolService'
import { createUserRoleService } from '@/lib/services/userRoleService'
import { createClient } from '@/lib/supabase/server'
import { ERole } from '@/types'

// Re-export interfaces for backward compatibility
export type { SchoolMember } from '@/lib/services/schoolService'

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
  const [authService, schoolService] = await Promise.all([
    createAuthorizationService(),
    createSchoolService(),
  ])

  const userId = await authService.getAuthenticatedUserId()
  await authService.verifyDirectorAccess(userId, schoolId)

  return schoolService.getSchoolMembers({ schoolId })
}

/**
 * Invite a new user to the school
 */
export async function inviteUserToSchool(request: InvitationRequest): Promise<InvitationResult> {
  const [supabase, authService, emailService] = await Promise.all([
    createClient(),
    createAuthorizationService(),
    createEmailService(),
  ])

  const userId = await authService.getAuthenticatedUserId()
  const schoolInfo = await authService.getDirectorSchoolInfo(userId)

  // Check if user already exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('id, email')
    .eq('email', request.email.toLowerCase())
    .single()

  const userExists = !!existingUser

  // If user exists, check if they're already in this school
  if (userExists) {
    const schoolService = await createSchoolService()
    const isInSchool = await schoolService.isUserInSchool(existingUser.id, schoolInfo.id)

    if (isInSchool) {
      return {
        success: false,
        message: 'Cet utilisateur fait déjà partie de cette école',
        userExists: true,
      }
    }
  }

  // Generate OTP
  const otp = generateOTP()

  // Save invitation to database
  const { error: inviteError } = await supabase
    .from('invite_to_school')
    .insert({
      school_id: schoolInfo.id,
      otp,
      created_by: userId,
      is_used: false,
      email: request.email.toLowerCase(),
      use_for: request.role.toString(),
    })

  if (inviteError) {
    throw new Error(`Failed to create invitation: ${inviteError.message}`)
  }

  // Send email
  try {
    await emailService.sendInvitationEmail({
      email: request.email,
      otp,
      schoolName: schoolInfo.name,
      schoolCode: schoolInfo.code,
      userExists,
      role: request.role,
    })

    return {
      success: true,
      message: userExists
        ? 'Invitation envoyée! L\'utilisateur recevra le code OTP par email.'
        : 'Invitation envoyée! L\'utilisateur devra d\'abord créer un compte, puis utiliser le code OTP.',
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
export async function validateOTPAndAddUser(otp: string): Promise<{ success: boolean, message: string }> {
  const supabase = await createClient()
  const userRoleService = await createUserRoleService()
  const authService = await createAuthorizationService()

  await authService.getAuthenticatedUserId()

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
    // Add user role with school_id
    const roleToAssign = invitation.use_for ? Number.parseInt(invitation.use_for, 10) : ERole.DIRECTOR

    await userRoleService.assignRole({
      userId: user.id,
      roleId: roleToAssign,
      schoolId: invitation.school_id,
    })

    // Mark invitation as used
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
  const authService = await createAuthorizationService()
  const userRoleService = await createUserRoleService()

  const currentUserId = await authService.getAuthenticatedUserId()
  await authService.verifyDirectorAccess(currentUserId, schoolId)

  // Don't allow removing the last director
  if (newRole !== ERole.DIRECTOR) {
    const isLastDirector = await authService.isLastDirector(userId, schoolId)
    if (isLastDirector) {
      return {
        success: false,
        message: 'Impossible de retirer le dernier directeur de l\'école',
      }
    }
  }

  try {
    await userRoleService.updateRole({
      userId,
      newRole,
      schoolId,
    })

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
  const authService = await createAuthorizationService()
  const userRoleService = await createUserRoleService()

  const currentUserId = await authService.getAuthenticatedUserId()

  // Don't allow removing yourself
  if (userId === currentUserId) {
    return {
      success: false,
      message: 'Vous ne pouvez pas vous retirer vous-même de l\'école',
    }
  }

  await authService.verifyDirectorAccess(currentUserId, schoolId)

  // Check if this is the last director
  const isLastDirector = await authService.isLastDirector(userId, schoolId)
  if (isLastDirector) {
    return {
      success: false,
      message: 'Impossible de retirer le dernier directeur de l\'école',
    }
  }

  try {
    await userRoleService.removeUserFromSchool(userId, schoolId)

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
