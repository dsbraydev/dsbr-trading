'use client'

import { BarChart, Bar, Cell, LabelList, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import type { AccountWithPnL } from '@/types/database'

const config: ChartConfig = {
  pnl: { label: 'P&L' },
}

function fmt(n: number) {
  if (Math.abs(n) >= 1000) return `$${(n / 1000).toFixed(1)}k`
  return `$${n.toFixed(0)}`
}

interface Props {
  accounts: AccountWithPnL[]
}

export function AccountsChart({ accounts }: Props) {
  const data = accounts.map((a) => ({ name: a.name, pnl: a.pnl }))

  if (data.length === 0) {
    return (
      <div className="h-[160px] flex items-center justify-center text-sm text-muted-foreground">
        No accounts yet
      </div>
    )
  }

  return (
    <ChartContainer config={config} className="h-[160px] w-full">
      <BarChart data={data} margin={{ top: 20, right: 8, left: 0, bottom: 4 }} barCategoryGap="40%">
        <defs>
          <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22c55e" stopOpacity={0.85} />
            <stop offset="100%" stopColor="#22c55e" stopOpacity={0.35} />
          </linearGradient>
          <linearGradient id="lossGrad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#ef4444" stopOpacity={0.85} />
            <stop offset="100%" stopColor="#ef4444" stopOpacity={0.35} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tickFormatter={fmt}
          tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
          tickLine={false}
          axisLine={false}
          width={44}
          tickCount={4}
        />
        <ReferenceLine y={0} stroke="var(--border)" strokeWidth={1} />
        <Tooltip
          cursor={{ fill: 'var(--muted)', opacity: 0.3, radius: 4 }}
          formatter={(value) => {
            const n = typeof value === 'number' ? value : 0
            return [`${n >= 0 ? '+' : ''}$${Math.abs(n).toFixed(2)}`, 'P&L']
          }}
          contentStyle={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            fontSize: '12px',
          }}
        />
        <Bar dataKey="pnl" radius={[4, 4, 0, 0]} maxBarSize={52}>
          <LabelList
            dataKey="pnl"
            position="top"
            formatter={(v: unknown) => {
              const n = typeof v === 'number' ? v : 0
              return n >= 0 ? `+$${Math.abs(n) >= 1000 ? `${(n / 1000).toFixed(1)}k` : n.toFixed(0)}` : `-$${Math.abs(n) >= 1000 ? `${(Math.abs(n) / 1000).toFixed(1)}k` : Math.abs(n).toFixed(0)}`
            }}
            style={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
          />
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.pnl >= 0 ? 'url(#profitGrad)' : 'url(#lossGrad)'} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}
