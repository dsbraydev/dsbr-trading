'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { TradeRow, TradeDetail, CreateTradeInput } from '@/types/database'

function extractStoragePath(publicUrl: string): string | null {
  const marker = '/trade-images/'
  const idx = publicUrl.indexOf(marker)
  return idx !== -1 ? publicUrl.slice(idx + marker.length) : null
}

export async function getTrades(type: 'normal' | 'challenge' = 'normal', limit?: number): Promise<TradeRow[]> {
  const supabase = await createClient()
  let query = supabase
    .from('trades')
    .select(`
      *,
      challenge:challenges(id, starting_balance),
      accounts:trade_accounts(
        account:accounts(id, name)
      ),
      checked_items:trade_checklist_items(checklist_item_id)
    `)

  query = type === 'challenge'
    ? query.not('challenge_id', 'is', null)
    : query.is('challenge_id', null)

  if (limit) query = query.limit(limit)

  const { data } = await query.order('traded_at', { ascending: false })
  return (data ?? []) as TradeRow[]
}

export async function getTrade(id: string): Promise<TradeDetail | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('trades')
    .select(`
      *,
      challenge:challenges(id, starting_balance),
      accounts:trade_accounts(
        account:accounts(id, name)
      ),
      checked_items:trade_checklist_items(
        checklist_item:checklist_items(id, name)
      )
    `)
    .eq('id', id)
    .single()

  return (data as TradeDetail | null) ?? null
}

export async function createTrade(input: CreateTradeInput) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  if (input.challengeId && input.accountIds.length > 0) {
    return { error: 'A trade cannot belong to both a challenge and an account' }
  }
  if (!input.challengeId && input.accountIds.length === 0) {
    return { error: 'Select at least one account or link to a challenge' }
  }

  const amount = input.win ? Math.abs(input.amount) : -Math.abs(input.amount)

  const { data: trade, error: tradeError } = await supabase
    .from('trades')
    .insert({
      user_id: user.id,
      currency: input.currency,
      win: input.win,
      amount,
      notes: input.notes,
      image_url: input.imageUrl,
      challenge_id: input.challengeId,
      traded_at: input.tradedAt,
    })
    .select('id')
    .single()

  if (tradeError || !trade) return { error: tradeError?.message ?? 'Failed to create trade' }

  if (input.accountIds.length > 0) {
    await supabase
      .from('trade_accounts')
      .insert(input.accountIds.map((accountId) => ({ trade_id: trade.id, account_id: accountId })))
  }

  if (input.checkedItemIds.length > 0) {
    await supabase.from('trade_checklist_items').insert(
      input.checkedItemIds.map((itemId) => ({
        trade_id: trade.id,
        checklist_item_id: itemId,
      })),
    )
  }

  revalidatePath('/trades')
  revalidatePath('/accounts')
  return { success: true, tradeId: trade.id }
}

export async function updateTrade(id: string, input: CreateTradeInput) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  if (input.challengeId && input.accountIds.length > 0) {
    return { error: 'A trade cannot belong to both a challenge and an account' }
  }
  if (!input.challengeId && input.accountIds.length === 0) {
    return { error: 'Select at least one account or link to a challenge' }
  }

  const { data: existing } = await supabase
    .from('trades')
    .select('image_url')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  const amount = input.win ? Math.abs(input.amount) : -Math.abs(input.amount)

  const { error: tradeError } = await supabase
    .from('trades')
    .update({
      currency: input.currency,
      win: input.win,
      amount,
      notes: input.notes,
      image_url: input.imageUrl,
      challenge_id: input.challengeId,
      traded_at: input.tradedAt,
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (tradeError) return { error: tradeError.message }

  if (existing?.image_url && existing.image_url !== input.imageUrl) {
    const path = extractStoragePath(existing.image_url)
    if (path) await supabase.storage.from('trade-images').remove([path])
  }

  await supabase.from('trade_accounts').delete().eq('trade_id', id)
  if (input.accountIds.length > 0) {
    await supabase
      .from('trade_accounts')
      .insert(input.accountIds.map((accountId) => ({ trade_id: id, account_id: accountId })))
  }

  await supabase.from('trade_checklist_items').delete().eq('trade_id', id)
  if (input.checkedItemIds.length > 0) {
    await supabase.from('trade_checklist_items').insert(
      input.checkedItemIds.map((itemId) => ({ trade_id: id, checklist_item_id: itemId })),
    )
  }

  revalidatePath('/trades')
  revalidatePath(`/trades/${id}`)
  revalidatePath('/accounts')
  return { success: true, tradeId: id }
}

export async function deleteTrade(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: trade } = await supabase
    .from('trades')
    .select('image_url')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  const { error } = await supabase.from('trades').delete().eq('id', id).eq('user_id', user.id)
  if (error) return { error: error.message }

  if (trade?.image_url) {
    const path = extractStoragePath(trade.image_url)
    if (path) await supabase.storage.from('trade-images').remove([path])
  }

  revalidatePath('/trades')
  revalidatePath('/accounts')
  return { success: true }
}
