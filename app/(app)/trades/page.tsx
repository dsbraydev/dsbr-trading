import { getTrades } from '@/lib/supabase/actions/trades'
import { getChecklistItems } from '@/lib/supabase/actions/checklist'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

function formatAmount(n: number) {
  return `${n >= 0 ? '+' : ''}$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default async function TradesPage() {
  const [trades, checklistItems] = await Promise.all([getTrades(), getChecklistItems()])
  const totalItems = checklistItems.length

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold">Trades</h1>
        <Link href="/trades/new">
          <Button size="sm">+ New trade</Button>
        </Link>
      </div>

      {trades.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-sm text-muted-foreground mb-4">No trades logged yet.</p>
          <Link href="/trades/new">
            <Button>Log your first trade</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-1.5">
          {trades.map((trade) => {
            const accountNames = trade.accounts
              .map((a) => a.account?.name)
              .filter(Boolean)
              .join(', ')
            const typeLabel = trade.challenge_id ? 'Challenge' : accountNames || '—'
            const checkedCount = trade.checked_items.length

            return (
              <Link
                key={trade.id}
                href={`/trades/${trade.id}`}
                className="flex items-center gap-4 px-4 py-3 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors"
              >
                <span className="text-xs text-muted-foreground w-14 shrink-0">
                  {new Date(trade.traded_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>

                <span className="text-sm font-medium w-16 shrink-0">{trade.currency}</span>

                <span
                  className={`text-xs px-1.5 py-0.5 rounded-md font-medium shrink-0 ${
                    trade.win
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-destructive'
                  }`}
                >
                  {trade.win ? 'Win' : 'Loss'}
                </span>

                <span
                  className={`text-sm font-medium tabular-nums w-24 shrink-0 ${
                    trade.amount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-destructive'
                  }`}
                >
                  {formatAmount(trade.amount)}
                </span>

                <span className="text-sm text-muted-foreground flex-1 truncate">{typeLabel}</span>

                {totalItems > 0 && (
                  <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
                    {checkedCount}/{totalItems}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
