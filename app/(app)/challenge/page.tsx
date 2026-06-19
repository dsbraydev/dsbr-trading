import { getActiveChallenge, createChallenge, cancelChallenge } from '@/lib/supabase/actions/challenge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CancelChallengeButton } from './cancel-button'

function formatAmount(n: number) {
  const sign = n >= 0 ? '+' : ''
  return `${sign}$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default async function ChallengePage() {
  const challenge = await getActiveChallenge()

  if (!challenge) {
    return (
      <div className="p-6 max-w-md">
        <h1 className="text-lg font-semibold mb-1">Challenge</h1>
        <p className="text-sm text-muted-foreground mb-6">
          No active challenge. Start one to track trades against a target balance.
        </p>

        <form action={createChallenge} className="border border-border rounded-xl p-4 space-y-3">
          <h2 className="text-sm font-medium">Start a challenge</h2>
          <div className="space-y-1.5">
            <Label htmlFor="starting_balance">Starting balance ($)</Label>
            <Input
              id="starting_balance"
              name="starting_balance"
              type="number"
              step="0.01"
              min="1"
              placeholder="10000"
              required
            />
          </div>
          <Button type="submit">Start challenge</Button>
        </form>
      </div>
    )
  }

  const pnl = challenge.trades.reduce((sum, t) => sum + t.amount, 0)
  const currentBalance = challenge.starting_balance + pnl
  const wins = challenge.trades.filter((t) => t.win).length
  const losses = challenge.trades.filter((t) => !t.win).length

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold">Active Challenge</h1>
          <p className="text-sm text-muted-foreground">
            Started ${challenge.starting_balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <CancelChallengeButton challengeId={challenge.id} cancelAction={cancelChallenge} />
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl border border-border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground mb-1">Current balance</p>
          <p className="text-lg font-semibold tabular-nums">
            ${currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground mb-1">P&amp;L</p>
          <p className={`text-lg font-semibold tabular-nums ${pnl >= 0 ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
            {formatAmount(pnl)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground mb-1">Win / Loss</p>
          <p className="text-lg font-semibold">
            <span className="text-green-600 dark:text-green-400">{wins}W</span>
            {' / '}
            <span className="text-destructive">{losses}L</span>
          </p>
        </div>
      </div>

      {challenge.trades.length === 0 ? (
        <p className="text-sm text-muted-foreground">No trades logged yet. Log a trade and assign it to this challenge.</p>
      ) : (
        <div>
          <h2 className="text-sm font-medium mb-2">Trades</h2>
          <ul className="space-y-1.5">
            {challenge.trades
              .slice()
              .sort((a, b) => new Date(b.traded_at).getTime() - new Date(a.traded_at).getTime())
              .map((trade) => (
                <li
                  key={trade.id}
                  className="flex items-center justify-between px-4 py-2.5 rounded-lg border border-border bg-card text-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {new Date(trade.traded_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="font-medium">{trade.currency}</span>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${
                        trade.win
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-destructive'
                      }`}
                    >
                      {trade.win ? 'Win' : 'Loss'}
                    </span>
                  </div>
                  <span
                    className={`font-medium tabular-nums ${trade.amount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}
                  >
                    {formatAmount(trade.amount)}
                  </span>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  )
}
