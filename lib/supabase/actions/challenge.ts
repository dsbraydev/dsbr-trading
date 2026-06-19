'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ChallengeWithTrades } from '@/types/database'

export async function getActiveChallenge(): Promise<ChallengeWithTrades | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('challenges')
    .select(`
      *,
      trades(id, currency, win, amount, traded_at)
    `)
    .eq('status', 'active')
    .maybeSingle()

  return (data as ChallengeWithTrades | null) ?? null
}

export async function createChallenge(formData: FormData): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  const startingBalance = parseFloat(formData.get('starting_balance') as string)
  if (isNaN(startingBalance) || startingBalance <= 0) return

  const { data: existing } = await supabase
    .from('challenges')
    .select('id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle()

  if (existing) return

  await supabase.from('challenges').insert({ starting_balance: startingBalance, user_id: user.id })

  revalidatePath('/challenge')
}

export async function cancelChallenge(id: string): Promise<void> {
  const supabase = await createClient()
  await supabase.from('challenges').delete().eq('id', id)
  revalidatePath('/challenge')
  revalidatePath('/trades')
}
