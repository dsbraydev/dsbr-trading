import { getAccountWithTrades } from '@/lib/supabase/actions/accounts'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { AccountBalanceChart } from '@/components/charts/account-balance-chart'

export default async function AccountDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const account = await getAccountWithTrades(id)

  if (!account) notFound()

  const balance = account.starting_balance + account.pnl
  const profit = account.pnl >= 0

  // Build cumulative balance data points for the chart
  const dataPoints: { label: string; balance: number; date?: string }[] = [
    { label: 'Start', balance: account.starting_balance },
  ]
  let running = account.starting_balance
  for (const trade of account.trades) {
    running += trade.amount
    dataPoints.push({
      label: `#${dataPoints.length}`,
      date: new Date(trade.traded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      balance: running,
    })
  }

  return (
    <div className="p-6 max-w-xl">
      <div className="flex items-center justify-between mb-6">
        <Link href="/accounts" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Accounts
        </Link>
      </div>

      <div className="space-y-3">
        {/* Header card */}
        <div className="rounded-xl border border-border bg-card px-4 py-4">
          <p className="text-xs text-muted-foreground mb-1">{account.name}</p>
          <p className="text-2xl font-semibold tabular-nums">
            ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-border bg-card px-4 py-3">
            <p className="text-xs text-muted-foreground mb-0.5">Starting Balance</p>
            <p className="text-sm font-medium tabular-nums">
              ${account.starting_balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card px-4 py-3">
            <p className="text-xs text-muted-foreground mb-0.5">P&amp;L</p>
            <p className={`text-sm font-medium tabular-nums ${profit ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
              {profit ? '+' : ''}${Math.abs(account.pnl).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="rounded-xl border border-border bg-card px-4 pt-3 pb-2">
          <p className="text-xs text-muted-foreground mb-2">Balance over time</p>
          <AccountBalanceChart dataPoints={dataPoints} profit={profit} />
        </div>

        {/* Trade history */}
        {account.trades.length > 0 && (
          <div className="rounded-xl border border-border bg-card px-4 py-3">
            <p className="text-xs text-muted-foreground mb-3">Trades ({account.trades.length})</p>
            <ul className="space-y-2">
              {[...account.trades].reverse().map((trade) => (
                <li key={trade.id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`shrink-0 px-1.5 py-0.5 rounded text-xs font-medium ${
                        trade.win
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-destructive'
                      }`}
                    >
                      {trade.win ? 'W' : 'L'}
                    </span>
                    <span className="text-sm font-medium truncate">{trade.currency}</span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {new Date(trade.traded_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <span
                    className={`text-sm font-medium tabular-nums shrink-0 ${
                      trade.amount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-destructive'
                    }`}
                  >
                    {trade.amount >= 0 ? '+' : ''}$
                    {Math.abs(trade.amount).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
