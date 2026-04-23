'use server'

import { createServiceClient, createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function markTicketHandled(formData: FormData): Promise<void> {
  if (!(await isAdmin())) return

  const ticketId = formData.get('ticket_id') as string | null
  if (!ticketId) return

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const service = await createServiceClient()
  await service
    .from('support_tickets')
    .update({
      status: 'handled',
      handled_by: user.id,
      handled_at: new Date().toISOString(),
    })
    .eq('id', ticketId)
    .eq('status', 'open') // idempotent — won't re-handle an already-handled ticket

  revalidatePath('/admin/support')
}
