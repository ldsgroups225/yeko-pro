'use server'

import type { SupabaseClient } from '@/lib/supabase/server'

export async function uploadImageToStorage(client: SupabaseClient, bucketName: string, studentId: string, avatarBase64: string): Promise<string> {
  // Delete existing avatar if it exists
  const { error: deleteError } = await client.storage
    .from(bucketName)
    .remove([studentId])

  if (deleteError && deleteError.message !== 'Not Found') {
    console.error('Error deleting old avatar:', deleteError)
  }

  // Extract MIME type from base64 string
  const mimeTypeMatch = avatarBase64.match(/^data:(.*?);/)
  if (!mimeTypeMatch) {
    throw new Error('Invalid avatar base64 data')
  }
  const mimeType = mimeTypeMatch[1]
  const base64Data = avatarBase64.split(',')[1]

  // Convert base64 to Uint8Array
  const byteString = atob(base64Data)
  const arrayBuffer = new ArrayBuffer(byteString.length)
  const uint8Array = new Uint8Array(arrayBuffer)
  for (let i = 0; i < byteString.length; i++) {
    uint8Array[i] = byteString.charCodeAt(i)
  }

  // Upload new avatar
  const blob = new Blob([uint8Array], { type: mimeType })
  const { data: uploadData, error: uploadError } = await client.storage
    .from(bucketName)
    .upload(studentId, blob, {
      contentType: mimeType,
      upsert: true,
    })

  if (uploadError) {
    console.error('Error uploading new avatar:', uploadError)
    throw new Error('Un problème est survenu lors de la sauvegarde de l\'image')
  }

  // Retrieve public URL
  const { data: { publicUrl } } = await client.storage
    .from(bucketName)
    .getPublicUrl(uploadData.path)

  return publicUrl
}
