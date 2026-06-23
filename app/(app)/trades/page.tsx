import { getTrades } from '@/lib/supabase/actions/trades'
import { getChecklistItems } from '@/lib/supabase/actions/checklist'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { TradeCard } from './trade-card'

export default async function TradesPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>
}) {
  const { filter } = await searchParams
  const type = filter === 'challenge' ? 'challenge' : 'normal'

  const [trades, checklistItems] = await Promise.all([getTrades(type), getChecklistItems()])

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold">Trades</h1>
        <Link href="/trades/new">
          <Button size="sm">+ New trade</Button>
        </Link>
      </div>

      <div className="flex gap-2 mb-5">
        <Link
          href="/trades"
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            type === 'normal'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          Normal
        </Link>
        <Link
          href="/trades?filter=challenge"
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            type === 'challenge'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          Challenge
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {trades.map((trade) => (
            <TradeCard
              key={trade.id}
              trade={trade}
              totalChecklistItems={checklistItems.length}
            />
          ))}
        </div>
      )}
    </div>
  )
}
