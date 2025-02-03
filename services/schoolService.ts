import type { SupabaseClient } from '@/lib/supabase/client'
import type { ISchoolDTO } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { ERole } from '@/types'
import { uploadImageToStorage } from './uploadImageService'

async function checkAuthUserId(client: SupabaseClient): Promise<string> {
  const { data: user, error: userError } = await client.auth.getUser()
  if (userError) {
    console.error('Error fetching user:', userError)
    throw new Error('Vous n\'êtes pas autorisé à accéder à cette page')
  }
  return user.user.id
}

async function getDirectorSchoolId(client: SupabaseClient, userId: string): Promise<string> {
  const { data: userSchool, error: userSchoolError } = await client
    .from('users')
    .select('school_id, user_roles(role_id)')
    .eq('id', userId)
    .eq('user_roles.role_id', ERole.DIRECTOR)
    .single()
  if (userSchoolError) {
    console.error('Error fetching user school:', userSchoolError)
    throw new Error('Seul un directeur peut accéder à cette page')
  }

  if (!userSchool.school_id) {
    throw new Error('Utilisateur non associé à un établissement scolaire')
  }
  return userSchool.school_id
}

export class SchoolService {
  static async updateSchool(schoolId: string, params: Partial<ISchoolDTO>): Promise<void> {
    const supabase = createClient()

    const userId = await checkAuthUserId(supabase)
    await getDirectorSchoolId(supabase, userId)

    const isBase64 = params.imageUrl?.startsWith('data:image')
    if (!isBase64) {
      delete params.imageUrl
    }
    else {
      if (!params.imageUrl) {
        throw new Error('Incorrect avatar')
      }
      // Process avatar upload and update params with new URL
      const newImageUrl = await uploadImageToStorage(supabase, 'school_image', params.id!, params.imageUrl)
      params.imageUrl = newImageUrl
    }

    const { error } = await supabase
      .from('schools')
      .update({
        name: params.name,
        city: params.city,
        phone: params.phone,
        email: params.email,
        address: params.address,
        image_url: params.imageUrl,
      })
      .eq('id', schoolId)
      .throwOnError()

    if (error) {
      console.error('Error updating school:', error)
      throw new Error('Une erreur est survenue lors de la mise à jour de l\'établissement')
    }
  }
}
