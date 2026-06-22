'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'

const config: ChartConfig = {
  balance: { label: 'Balance' },
}

interface DataPoint {
  label: string
  balance: number
}

interface Props {
  dataPoints: DataPoint[]
}

export function ChallengeChart({ dataPoints }: Props) {
  if (dataPoints.length <= 1) {
    return (
      <div className="h-[160px] flex items-center justify-center text-sm text-muted-foreground">
        No trades yet
      </div>
    )
  }

  return (
    <ChartContainer config={config} className="h-[160px] w-full">
      <AreaChart data={dataPoints} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
        <defs>
          <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
          tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
          tickLine={false}
          axisLine={false}
          width={44}
        />
        <Tooltip
          formatter={(value) => {
            const n = typeof value === 'number' ? value : 0
            return [`$${n.toFixed(2)}`, 'Balance']
          }}
          contentStyle={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            fontSize: '12px',
          }}
        />
        <Area
          type="monotone"
          dataKey="balance"
          stroke="#22c55e"
          strokeWidth={2}
          fill="url(#balanceGrad)"
          dot={false}
          activeDot={{ r: 4, fill: '#22c55e' }}
        />
      </AreaChart>
    </ChartContainer>
  )
}
