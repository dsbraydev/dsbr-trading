'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { AccountWithPnL } from '@/types/database'

export async function getAccountsWithPnL(): Promise<AccountWithPnL[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('accounts')
    .select(`
      *,
      trade_accounts(
        trade:trades(amount)
      )
    `)
    .order('created_at', { ascending: true })

  return (data ?? []).map((account: any) => {
    const pnl = (account.trade_accounts as Array<{ trade: { amount: number } | null }>).reduce(
      (sum, ta) => sum + (ta.trade?.amount ?? 0),
      0,
    )
    return {
      id: account.id as string,
      user_id: account.user_id as string,
      name: account.name as string,
      starting_balance: account.starting_balance as number,
      created_at: account.created_at as string,
      pnl,
    }
  })
}

export async function createAccount(formData: FormData): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  const name = (formData.get('name') as string)?.trim()
  const startingBalance = parseFloat(formData.get('starting_balance') as string)

  if (!name || isNaN(startingBalance)) return

  await supabase.from('accounts').insert({ name, starting_balance: startingBalance, user_id: user.id })

  revalidatePath('/accounts')
}

export async function updateAccount(id: string, formData: FormData): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return
  const name = (formData.get('name') as string)?.trim()
  const startingBalance = parseFloat(formData.get('starting_balance') as string)
  if (!name || isNaN(startingBalance)) return
  await supabase
    .from('accounts')
    .update({ name, starting_balance: startingBalance })
    .eq('id', id)
    .eq('user_id', user.id)
  revalidatePath('/accounts')
}

export async function getAccountWithTrades(id: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('accounts')
    .select(`
      *,
      trade_accounts(
        trade:trades(id, amount, win, currency, traded_at)
      )
    `)
    .eq('id', id)
    .single()

  if (!data) return null

  const trades = (data.trade_accounts as Array<{ trade: { id: string; amount: number; win: boolean; currency: string; traded_at: string } | null }>)
    .map((ta) => ta.trade)
    .filter((t): t is { id: string; amount: number; win: boolean; currency: string; traded_at: string } => t !== null)
    .sort((a, b) => new Date(a.traded_at).getTime() - new Date(b.traded_at).getTime())

  const pnl = trades.reduce((sum, t) => sum + t.amount, 0)

  return {
    id: data.id as string,
    user_id: data.user_id as string,
    name: data.name as string,
    starting_balance: data.starting_balance as number,
    created_at: data.created_at as string,
    pnl,
    trades,
  }
}

export async function deleteAccount(id: string): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('accounts').delete().eq('id', id).eq('user_id', user.id)

  // Clean up stray trades: prop trades that now have no accounts linked
  if (user) {
    const { data: propTrades } = await supabase
      .from('trades')
      .select('id, trade_accounts(trade_id)')
      .eq('user_id', user.id)
      .is('challenge_id', null)

    const strayIds = (propTrades ?? [])
      .filter((t: any) => (t.trade_accounts as any[]).length === 0)
      .map((t: any) => t.id as string)

    if (strayIds.length > 0) {
      await supabase.from('trades').delete().in('id', strayIds)
    }
  }

  revalidatePath('/accounts')
  revalidatePath('/trades')
}
