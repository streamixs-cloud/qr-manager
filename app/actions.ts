'use server'

import { revalidatePath } from 'next/cache'
import { nanoid } from 'nanoid'
import { supabase } from '@/lib/supabase'

export type ActionState = {
  error?: string
  success?: boolean
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export async function createLink(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const destination = (formData.get('destination') as string)?.trim()
  const label = (formData.get('label') as string)?.trim() || null
  const slugInput = (formData.get('slug') as string)?.trim()

  if (!destination) {
    return { error: 'Destination URL is required' }
  }

  if (!isValidUrl(destination)) {
    return { error: 'Please enter a valid URL including https://' }
  }

  const slug = slugInput || nanoid(8)

  const { error } = await supabase.from('links').insert({
    slug,
    destination,
    label,
  })

  if (error) {
    if (error.code === '23505') {
      return { error: 'That slug is already taken — try a different one' }
    }
    return { error: error.message }
  }

  revalidatePath('/')
  return { success: true }
}

export async function deleteLink(id: string): Promise<void> {
  await supabase.from('links').delete().eq('id', id)
  revalidatePath('/')
}
