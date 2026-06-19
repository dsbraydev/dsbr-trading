'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ChallengeWithTrades } from '@/types/database'
import { CHALLENGE_START_BALANCE } from '@/lib/challenge-levels'

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

export async function createChallenge(): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  const { data: existing } = await supabase
    .from('challenges')
    .select('id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle()

  if (existing) return

  await supabase.from('challenges').insert({ starting_balance: CHALLENGE_START_BALANCE, user_id: user.id })

  revalidatePath('/challenge')
}

export async function cancelChallenge(id: string): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return
  await supabase.from('challenges').delete().eq('id', id).eq('user_id', user.id)
  revalidatePath('/challenge')
  revalidatePath('/trades')
}
