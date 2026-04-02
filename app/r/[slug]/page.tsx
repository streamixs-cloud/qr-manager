import { redirect, notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { supabase } from '@/lib/supabase'

export default async function RedirectPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const { data: link, error } = await supabase
    .from('links')
    .select('id, destination, scan_count')
    .eq('slug', slug)
    .single()

  if (error || !link) {
    notFound()
  }

  const h = await headers()

  // Fire-and-forget: increment scan_count and record scan event
  supabase
    .from('links')
    .update({ scan_count: link.scan_count + 1 })
    .eq('slug', slug)
    .then(() => {})

  supabase
    .from('scan_events')
    .insert({
      link_id: link.id,
      user_agent: h.get('user-agent'),
      referer: h.get('referer'),
    })
    .then(() => {})

  redirect(link.destination)
}
