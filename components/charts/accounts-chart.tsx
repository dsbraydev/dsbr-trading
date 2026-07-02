'use client'

import { BarChart, Bar, Cell, LabelList, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import type { DailyPnL } from '@/types/database'

const config: ChartConfig = {
  pnl: { label: 'P&L' },
}

function fmt(n: number) {
  if (Math.abs(n) >= 1000) return `$${(n / 1000).toFixed(1)}k`
  return `$${Math.abs(n).toFixed(0)}`
}

function dayLabel(dateStr: string): string {
  const today = new Date().toISOString().split('T')[0]
  if (dateStr === today) return 'Today'
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' })
}

interface Props {
  dailyPnl: DailyPnL[]
}

export function AccountsChart({ dailyPnl }: Props) {
  const allZero = dailyPnl.every((d) => d.pnl === 0)

  if (allZero) {
    return (
      <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">
        No trades in the last 7 days
      </div>
    )
  }

  const data = dailyPnl.map((d) => ({ name: dayLabel(d.date), pnl: d.pnl }))

  return (
    <ChartContainer config={config} className="h-[200px] w-full">
      <BarChart data={data} margin={{ top: 24, right: 8, left: 0, bottom: 4 }} barCategoryGap="35%">
        <defs>
          <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22c55e" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#22c55e" stopOpacity={0.6} />
          </linearGradient>
          <linearGradient id="lossGrad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#ef4444" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#ef4444" stopOpacity={0.6} />
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
          domain={([min, max]: readonly [number, number]) => {
            const pad = Math.max(Math.abs(max - min) * 0.4, 80)
            return [Math.min(min, 0) - pad, Math.max(max, 0) + pad] as [number, number]
          }}
        />
        <ReferenceLine y={0} stroke="var(--border)" strokeWidth={1} />
        <Tooltip
          cursor={{ fill: 'var(--muted)', opacity: 0.3, radius: 4 }}
          formatter={(value) => {
            const n = typeof value === 'number' ? value : 0
            return [`${n >= 0 ? '+' : '-'}$${Math.abs(n).toFixed(2)}`, 'P&L']
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
            content={({ x, y, width, value }) => {
              const n = typeof value === 'number' ? value : 0
              if (n === 0) return null
              const color = n >= 0 ? '#22c55e' : '#ef4444'
              const label = n >= 0 ? `+${fmt(n)}` : `-${fmt(Math.abs(n))}`
              return (
                <text
                  x={Number(x) + Number(width) / 2}
                  y={Number(y) - 6}
                  textAnchor="middle"
                  fontSize={10}
                  fontWeight={500}
                  fill={color}
                >
                  {label}
                </text>
              )
            }}
          />
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={entry.pnl > 0 ? 'url(#profitGrad)' : entry.pnl < 0 ? 'url(#lossGrad)' : 'var(--muted)'}
            />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}
