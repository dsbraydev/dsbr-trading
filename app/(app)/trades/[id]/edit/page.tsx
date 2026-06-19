import { getTrade } from '@/lib/supabase/actions/trades'
import { getAccountsWithPnL } from '@/lib/supabase/actions/accounts'
import { getChecklistItems } from '@/lib/supabase/actions/checklist'
import { getActiveChallenge } from '@/lib/supabase/actions/challenge'
import { TradeForm } from '../../new/trade-form'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function EditTradePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [trade, accounts, checklistItems, activeChallenge] = await Promise.all([
    getTrade(id),
    getAccountsWithPnL(),
    getChecklistItems(),
    getActiveChallenge(),
  ])

  if (!trade) notFound()

  const initialValues = {
    currency: trade.currency,
    win: trade.win,
    amount: Math.abs(trade.amount),
    type: (trade.challenge_id ? 'challenge' : 'prop') as 'prop' | 'challenge',
    accountIds: trade.accounts.map((a) => a.account?.id).filter(Boolean) as string[],
    checkedItemIds: trade.checked_items
      .map((ci) => ci.checklist_item?.id)
      .filter(Boolean) as string[],
    notes: trade.notes ?? '',
    existingImageUrl: trade.image_url,
    tradedAt: new Date(trade.traded_at).toISOString().slice(0, 16),
  }

  return (
    <div className="p-6 max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href={`/trades/${id}`}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back
        </Link>
        <h1 className="text-lg font-semibold">Edit Trade</h1>
      </div>

      <TradeForm
        accounts={accounts.map(({ id, name }) => ({ id, name }))}
        checklistItems={checklistItems}
        activeChallenge={
          activeChallenge
            ? { id: activeChallenge.id, starting_balance: activeChallenge.starting_balance }
            : null
        }
        tradeId={id}
        initialValues={initialValues}
      />
    </div>
  )
}
