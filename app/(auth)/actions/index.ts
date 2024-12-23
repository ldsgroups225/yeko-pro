'use server'

import type { IUserProfileDTO } from '@/types'
import type { ILogin } from '@/validations'
import { createClient } from '@/lib/supabase/server'
import { ERole, roleToString } from '@/types'
import { loginSchema } from '@/validations'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

/**
 * Validates and parses form data according to a predefined schema.
 * If validation fails, the user is redirected to an error page with the appropriate error message.
 *
 * @returns {Promise<{email: string, password: string, rememberMe?: boolean}>} - A Promise resolving to the parsed and validated form data.
 * @throws {void} - Redirects to an error page if validation fails.
 * @param values
 */
async function validateAndParseFormData(values: ILogin): Promise<{ email: string, password: string, rememberMe?: boolean, errors?: Partial<ILogin> | null }> {
  const result = loginSchema.safeParse({
    email: values.email,
    password: values.password,
    rememberMe: values.rememberMe,
  })

  if (!result.success) {
    throw new Error(`Invalid login form data: ${result.error.errors.map(err => err.message).join(', ')}`)
  }

  return result.data
}

/**
 * Authenticates a user using their email and password.
 *
 * @param {ILogin} values - The login form data containing email and password
 * @returns {Promise<string>} The authenticated user's ID
 * @throws {Error} With message 'Email ou mot de passe incorrect' if credentials are invalid
 * @throws {Error} With message 'Une erreur est survenue' for other authentication errors
 * @example
 * try {
 *   const userId = await login({ email: 'user@example.com', password: '******' });
 *   // Handle successful login
 * } catch (error) {
 *   // Handle authentication error
 * }
 */
export async function login(values: ILogin): Promise<string> {
  const supabase = createClient()

  const { email, password } = await validateAndParseFormData(values)
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    if (error.status === 400) {
      throw new Error('Email ou mot de passe incorrect')
    }
    throw new Error('Une erreur est survenue')
  }

  return data.user.id
}

/**
 * Registers a new user with their email and password.
 *
 * @param { { email: string, password: string } } values - The registration form data containing email and password
 * @returns {Promise<string>} The newly created user's ID
 * @throws {Error} With message 'Email déjà utilisé' if email already exists
 * @throws {Error} With message 'Une erreur est survenue lors de l\'inscription' for other registration errors
 */
export async function signup(values: { email: string, password: string }): Promise<string> {
  const supabase = createClient()

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: values.email,
    password: values.password,
  })

  if (authError) {
    if (authError.status === 400) {
      throw new Error('Email déjà utilisé')
    }
    throw new Error('Une erreur est survenue lors de l\'inscription')
  }

  if (authData.user === null) {
    throw new Error('Une erreur est survenue lors de l\'inscription')
  }

  // Create user profile in users table
  const { error: profileError } = await supabase
    .from('users')
    .insert({
      id: authData.user.id,
      email: values.email,
    })

  if (profileError) {
    throw new Error('Erreur lors de la création du profil')
  }

  // Create user role in user_roles table
  const { error: roleError } = await supabase
    .from('user_roles')
    .insert({
      user_id: authData.user.id,
      role_id: ERole.TEACHER,
    })

  if (roleError) {
    throw new Error('Erreur lors de la création de la rôle')
  }

  return authData.user.id
}

/**
 * Signs out the current user.
 *
 * @throws {Error} With message 'Erreur lors de la déconnexion' if logout fails
 */
export async function logout(): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    throw new Error('Erreur lors de la déconnexion')
  }

  revalidatePath('/')
  redirect('/login')
}

/**
 * Gets the current authenticated user's basic information.
 *
 * @returns {Promise<string | null>} The current user ID or null if not authenticated
 */
export async function getUser(): Promise<string | null> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  return user?.id ?? null
}

/**
 * Fetches the complete user profile including role information for a director.
 *
 * @returns {Promise<IUserProfileDTO | null>} The user's complete profile or null if not found
 * @throws {Error} With message 'Erreur lors de la récupération du profil' if fetch fails
 */
export async function fetchUserProfile(): Promise<IUserProfileDTO | null> {
  const supabase = createClient()
  const userId = await getUser()

  if (!userId) {
    return null
  }

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select(`
      id,
      email,
      first_name,
      last_name,
      phone,
      user_roles(role_id),
      school_id
    `)
    .eq('id', userId)
    .eq('user_roles.role_id', ERole.DIRECTOR)
    .single()

  if (profileError) {
    throw new Error('Erreur lors de la récupération du profil')
  }

  const {
    data: school,
  } = await supabase.from('schools').select('*').eq('id', profile.school_id!).single()

  if (!school) {
    throw new Error('Nous n\'avons pas trouvé votre école, veuillez vous ré-authentifier')
  }

  return {
    id: userId,
    email: profile.email!,
    firstName: profile.first_name ?? '',
    lastName: profile.last_name ?? '',
    fullName: `${profile.first_name} ${profile.last_name}`,
    phoneNumber: profile.phone ?? '',
    role: roleToString(ERole.DIRECTOR),
    school: {
      id: school.id,
      name: school.name,
      code: school.code,
      imageUrl: school.image_url ?? '',
      createdAt: school.created_at ?? '',
      createdBy: school.created_by ?? '',
      updatedAt: school.updated_at ?? '',
      updatedBy: school.updated_by ?? '',
    },
  }
}
