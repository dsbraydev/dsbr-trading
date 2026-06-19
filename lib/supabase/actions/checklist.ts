'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ChecklistItem } from '@/types/database'

export async function getChecklistItems(): Promise<ChecklistItem[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('checklist_items')
    .select('*')
    .order('display_order', { ascending: true })
  return (data ?? []) as ChecklistItem[]
}

export async function createChecklistItem(formData: FormData): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  const name = (formData.get('name') as string)?.trim()
  if (!name) return

  const { data: existing } = await supabase
    .from('checklist_items')
    .select('display_order')
    .eq('user_id', user.id)
    .order('display_order', { ascending: false })
    .limit(1)

  const nextOrder = existing && existing.length > 0 ? existing[0].display_order + 1 : 0

  await supabase
    .from('checklist_items')
    .insert({ name, user_id: user.id, display_order: nextOrder })

  revalidatePath('/checklist')
}

export async function deleteChecklistItem(id: string): Promise<void> {
  const supabase = await createClient()
  await supabase.from('checklist_items').delete().eq('id', id)
  revalidatePath('/checklist')
}
