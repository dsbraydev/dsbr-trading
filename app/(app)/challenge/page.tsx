import { getActiveChallenge, createChallenge, cancelChallenge } from '@/lib/supabase/actions/challenge'
import { Button } from '@/components/ui/button'
import { CancelChallengeButton } from './cancel-button'
import { CHALLENGE_LEVELS, CHALLENGE_COMPLETE_BALANCE, CHALLENGE_START_BALANCE, getLevelForBalance } from '@/lib/challenge-levels'
import Link from 'next/link'

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmtSigned(n: number) {
  const sign = n >= 0 ? '+' : ''
  return `${sign}$${fmt(Math.abs(n))}`
}

export default async function ChallengePage() {
  const challenge = await getActiveChallenge()

  if (!challenge) {
    return (
      <div className="p-6 max-w-md">
        <h1 className="text-lg font-semibold mb-1">Challenge</h1>
        <p className="text-sm text-muted-foreground mb-6">
          A 30-level compounding challenge starting at $20. Win trades to progress, lose to drop back.
        </p>
        <form action={createChallenge}>
          <Button type="submit">Start 30-Level Challenge</Button>
        </form>
      </div>
    )
  }

  const pnl = challenge.trades.reduce((sum, t) => sum + t.amount, 0)
  const currentBalance = challenge.starting_balance + pnl
  const wins = challenge.trades.filter((t) => t.win).length
  const losses = challenge.trades.filter((t) => !t.win).length
  const currentLevel = getLevelForBalance(currentBalance)
  const isFailed = currentBalance < CHALLENGE_START_BALANCE
  const isComplete = currentBalance >= CHALLENGE_COMPLETE_BALANCE

  const sortedTrades = [...challenge.trades].sort(
    (a, b) => new Date(b.traded_at).getTime() - new Date(a.traded_at).getTime(),
  )

  return (
    <div className="p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold">Active Challenge</h1>
          <p className="text-sm text-muted-foreground">30-Level Compounding Challenge</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/trades/new?type=challenge&from=challenge"
            className="inline-flex items-center h-8 px-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            + Log Trade
          </Link>
          <CancelChallengeButton challengeId={challenge.id} cancelAction={cancelChallenge} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl border border-border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground mb-1">Current balance</p>
          <p className="text-lg font-semibold tabular-nums">${fmt(currentBalance)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground mb-1">P&amp;L</p>
          <p className={`text-lg font-semibold tabular-nums ${pnl >= 0 ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
            {fmtSigned(pnl)}
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

      {isFailed && (
        <div className="mb-6 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive font-medium">
          Challenge Failed — your balance dropped below $20.00. Cancel this challenge and start a new one.
        </div>
      )}

      {isComplete && (
        <div className="mb-6 rounded-xl border border-green-500/40 bg-green-500/10 px-4 py-3 text-sm text-green-700 dark:text-green-400 font-medium">
          Challenge Complete — you have reached all 30 levels!
        </div>
      )}

      <div className="grid grid-cols-[1fr_360px] gap-6 items-start">
        {/* Level table */}
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Level</th>
                <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">Start</th>
                <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">Risk (20%)</th>
                <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">Reward (30%)</th>
                <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">Target</th>
              </tr>
            </thead>
            <tbody>
              {CHALLENGE_LEVELS.map((lvl) => {
                const isCurrentLevel = !isFailed && !isComplete && lvl.level === currentLevel.level
                return (
                  <tr
                    key={lvl.level}
                    className={`border-b border-border last:border-0 ${
                      isCurrentLevel
                        ? 'bg-amber-50 dark:bg-amber-950/40'
                        : 'hover:bg-muted/30'
                    }`}
                  >
                    <td className="px-3 py-2 tabular-nums">
                      <span className={`font-medium ${isCurrentLevel ? 'text-amber-700 dark:text-amber-400' : ''}`}>
                        {isCurrentLevel ? '▶ ' : ''}{lvl.level}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">${fmt(lvl.startBalance)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-destructive">${fmt(lvl.risk)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-green-600 dark:text-green-400">${fmt(lvl.reward)}</td>
                    <td className="px-3 py-2 text-right tabular-nums font-medium">${fmt(lvl.endBalance)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Trade list */}
        <div>
          <h2 className="text-sm font-medium mb-2">Trades</h2>
          {sortedTrades.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No trades yet.{' '}
              <Link href="/trades/new?type=challenge&from=challenge" className="underline hover:text-foreground transition-colors">
                Log one now.
              </Link>
            </p>
          ) : (
            <ul className="space-y-1.5">
              {sortedTrades.map((trade) => (
                <li key={trade.id}>
                  <Link
                    href={`/trades/${trade.id}`}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-border bg-card text-sm hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
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
                      {fmtSigned(trade.amount)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
