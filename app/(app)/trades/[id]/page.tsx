import { getTrade, deleteTrade } from '@/lib/supabase/actions/trades'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { DeleteTradeButton } from './delete-button'

export default async function TradePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const trade = await getTrade(id)

  if (!trade) notFound()

  const accountNames = trade.accounts
    .map((a) => a.account?.name)
    .filter(Boolean)
    .join(', ')

  return (
    <div className="p-6 max-w-xl">
      <div className="flex items-center justify-between mb-6">
        <Link href="/trades" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Trades
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href={`/trades/${trade.id}/edit`}
            className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg border border-border bg-background text-sm font-medium hover:bg-muted transition-colors"
          >
            Edit
          </Link>
          <DeleteTradeButton id={trade.id} deleteAction={deleteTrade} />
        </div>
      </div>

      <div className="space-y-3">
        {/* Header card */}
        <div className="rounded-xl border border-border bg-card px-4 py-4 flex items-center gap-3">
          <span className="text-xl font-semibold">{trade.currency}</span>
          <span
            className={`px-2 py-0.5 rounded-md text-sm font-medium ${
              trade.win
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-destructive'
            }`}
          >
            {trade.win ? 'Win' : 'Loss'}
          </span>
          <span
            className={`text-xl font-semibold tabular-nums ml-auto ${
              trade.amount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-destructive'
            }`}
          >
            {trade.amount >= 0 ? '+' : ''}$
            {Math.abs(trade.amount).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-border bg-card px-4 py-3">
            <p className="text-xs text-muted-foreground mb-0.5">Type</p>
            <p className="text-sm font-medium">{trade.challenge_id ? 'Challenge' : 'Prop Firm'}</p>
          </div>

          {!trade.challenge_id && (
            <div className="rounded-xl border border-border bg-card px-4 py-3">
              <p className="text-xs text-muted-foreground mb-0.5">Accounts</p>
              <p className="text-sm font-medium">{accountNames || '—'}</p>
            </div>
          )}

          <div className="rounded-xl border border-border bg-card px-4 py-3">
            <p className="text-xs text-muted-foreground mb-0.5">Date</p>
            <p className="text-sm font-medium">
              {new Date(trade.traded_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>

        {/* Checklist */}
        {trade.checked_items.length > 0 && (
          <div className="rounded-xl border border-border bg-card px-4 py-3">
            <p className="text-xs text-muted-foreground mb-2">
              Checklist ({trade.checked_items.length} checked)
            </p>
            <ul className="space-y-1">
              {trade.checked_items.map(
                (ci) =>
                  ci.checklist_item && (
                    <li key={ci.checklist_item.id} className="text-sm flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-primary shrink-0" />
                      {ci.checklist_item.name}
                    </li>
                  ),
              )}
            </ul>
          </div>
        )}

        {/* Notes */}
        {trade.notes && (
          <div className="rounded-xl border border-border bg-card px-4 py-3">
            <p className="text-xs text-muted-foreground mb-1">Notes</p>
            <p className="text-sm whitespace-pre-wrap">{trade.notes}</p>
          </div>
        )}

        {/* Screenshot */}
        {trade.image_url && (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <p className="text-xs text-muted-foreground px-4 pt-3 mb-2">Screenshot</p>
            <img
              src={trade.image_url}
              alt="Trade screenshot"
              className="w-full object-contain max-h-96 pb-3 px-3"
            />
          </div>
        )}
      </div>
    </div>
  )
}
