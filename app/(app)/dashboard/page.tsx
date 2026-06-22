import { getAccountsWithPnL } from '@/lib/supabase/actions/accounts'
import { getActiveChallenge } from '@/lib/supabase/actions/challenge'
import { getChecklistItems } from '@/lib/supabase/actions/checklist'
import { getTrades } from '@/lib/supabase/actions/trades'
import { getLevelForBalance, CHALLENGE_LEVELS, CHALLENGE_START_BALANCE } from '@/lib/challenge-levels'
import { AccountsChart } from '@/components/charts/accounts-chart'
import { ChallengeChart } from '@/components/charts/challenge-chart'
import Link from 'next/link'

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmtSigned(n: number) {
  return `${n >= 0 ? '+' : '-'}$${fmt(Math.abs(n))}`
}

export default async function DashboardPage() {
  const [accounts, challenge, checklistItems, propTrades] = await Promise.all([
    getAccountsWithPnL(),
    getActiveChallenge(),
    getChecklistItems(),
    getTrades(),
  ])

  // Accounts stats
  const totalCapital = accounts.reduce((s, a) => s + a.starting_balance, 0)
  const totalPnL = accounts.reduce((s, a) => s + a.pnl, 0)
  const top3Accounts = [...accounts]
    .sort((a, b) => (b.starting_balance + b.pnl) - (a.starting_balance + a.pnl))
    .slice(0, 3)

  // Challenge stats
  const challengePnL = challenge
    ? challenge.trades.reduce((s, t) => s + t.amount, 0)
    : 0
  const currentBalance = challenge ? challenge.starting_balance + challengePnL : 0
  const currentLevel = challenge ? getLevelForBalance(currentBalance) : null

  const challengeDataPoints = (() => {
    if (!challenge) return []
    const sorted = [...challenge.trades].sort(
      (a, b) => new Date(a.traded_at).getTime() - new Date(b.traded_at).getTime(),
    )
    let running = challenge.starting_balance
    const points = [{ label: 'Start', balance: running }]
    sorted.forEach((t, i) => {
      running += t.amount
      points.push({
        label: new Date(t.traded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        balance: Math.round(running * 100) / 100,
      })
    })
    return points
  })()

  const recentChallengeTrades = challenge
    ? [...challenge.trades]
        .sort((a, b) => new Date(b.traded_at).getTime() - new Date(a.traded_at).getTime())
        .slice(0, 5)
    : []

  // Prop trade stats
  const totalPropTrades = propTrades.length
  const propWins = propTrades.filter((t) => t.win).length
  const winRate = totalPropTrades > 0 ? Math.round((propWins / totalPropTrades) * 100) : null
  const bestTrade = propTrades
    .filter((t) => t.win)
    .reduce<number | null>((max, t) => (max === null || t.amount > max ? t.amount : max), null)

  return (
    <div className="p-6 max-w-7xl space-y-6">
      <h1 className="text-lg font-semibold">Dashboard</h1>

      {/* Row 1 — summary stat cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground mb-1">Total capital</p>
          <p className="text-lg font-semibold tabular-nums">${fmt(totalCapital)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground mb-1">Combined P&amp;L</p>
          <p className={`text-lg font-semibold tabular-nums ${totalPnL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
            {fmtSigned(totalPnL)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground mb-1">Challenge level</p>
          <p className="text-lg font-semibold">
            {currentLevel ? (
              <span>{currentLevel.level} <span className="text-sm font-normal text-muted-foreground">/ {CHALLENGE_LEVELS.length}</span></span>
            ) : (
              <span className="text-sm font-normal text-muted-foreground">No active challenge</span>
            )}
          </p>
        </div>
      </div>

      {/* Row 2 — accounts + challenge */}
      <div className="grid grid-cols-[3fr_2fr] gap-6">
        {/* Accounts section */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Prop Accounts</h2>
            <Link href="/accounts" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              View all →
            </Link>
          </div>
          <AccountsChart accounts={accounts} />
          {top3Accounts.length > 0 && (
            <div className="mt-4 space-y-1.5">
              {top3Accounts.map((a, i) => {
                const balance = a.starting_balance + a.pnl
                return (
                  <div key={a.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-4">{i + 1}.</span>
                      <span className="font-medium">{a.name}</span>
                    </div>
                    <div className="flex items-center gap-3 tabular-nums">
                      <span className={`text-xs ${a.pnl >= 0 ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
                        {fmtSigned(a.pnl)}
                      </span>
                      <span className="font-medium">${fmt(balance)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          {accounts.length === 0 && (
            <p className="mt-3 text-sm text-muted-foreground">
              No accounts yet.{' '}
              <Link href="/accounts" className="underline">Add one →</Link>
            </p>
          )}
        </div>

        {/* Challenge section */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Challenge</h2>
            <Link href="/challenge" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              View all →
            </Link>
          </div>
          {challenge && currentLevel ? (
            <>
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-muted-foreground">Level {currentLevel.level} / {CHALLENGE_LEVELS.length}</span>
                  <span className="text-xs font-medium tabular-nums">${fmt(currentBalance)}</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber-500"
                    style={{ width: `${(currentLevel.level / CHALLENGE_LEVELS.length) * 100}%` }}
                  />
                </div>
              </div>
              <ChallengeChart dataPoints={challengeDataPoints} />
              {recentChallengeTrades.length > 0 && (
                <ul className="mt-3 space-y-1">
                  {recentChallengeTrades.map((t) => (
                    <li key={t.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">
                          {new Date(t.traded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <span className="font-medium">{t.currency}</span>
                        <span className={`px-1 py-0.5 rounded text-xs font-medium ${
                          t.win
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-destructive'
                        }`}>
                          {t.win ? 'W' : 'L'}
                        </span>
                      </div>
                      <span className={`tabular-nums font-medium ${t.amount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
                        {fmtSigned(t.amount)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-sm text-muted-foreground mb-3">No active challenge</p>
              <Link href="/challenge" className="text-sm font-medium underline">
                Start 30-Level Challenge →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Row 3 — checklist + quick stats */}
      <div className="grid grid-cols-2 gap-6">
        {/* Checklist reminder */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Pre-Trade Checklist</h2>
            <Link href="/checklist" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Manage →
            </Link>
          </div>
          {checklistItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No checklist items.{' '}
              <Link href="/checklist" className="underline">Add some →</Link>
            </p>
          ) : (
            <ul className="space-y-1.5">
              {checklistItems.map((item, i) => (
                <li key={item.id} className="flex items-center gap-2 text-sm">
                  <span className="size-4 rounded border border-border shrink-0" />
                  {item.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Prop trade quick stats */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold mb-3">Prop Trade Stats</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total trades</span>
              <span className="font-semibold tabular-nums">{totalPropTrades}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Win rate</span>
              <span className="font-semibold tabular-nums">
                {winRate !== null ? `${winRate}%` : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Best trade</span>
              <span className="font-semibold tabular-nums text-green-600 dark:text-green-400">
                {bestTrade !== null ? `+$${fmt(bestTrade)}` : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Wins / Losses</span>
              <span className="font-semibold tabular-nums">
                <span className="text-green-600 dark:text-green-400">{propWins}W</span>
                {' / '}
                <span className="text-destructive">{totalPropTrades - propWins}L</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
