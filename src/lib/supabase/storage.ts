import { createClient } from '@/lib/supabase/client'

// Generates a temporary signed URL (expires in 1 hour)
export async function getSignedUrl(filePath: string): Promise<string | null> {
  const supabase = createClient()

  const { data, error } = await supabase.storage
    .from('documents')
    .createSignedUrl(filePath, 3600) // 3600 seconds = 1 hour

  if (error) {
    console.error('Error creating signed URL:', error.message)
    return null
  }

  return data.signedUrl
}