'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'

const config: ChartConfig = {
  balance: { label: 'Balance' },
}

interface DataPoint {
  label: string
  balance: number
  date?: string
}

interface Props {
  dataPoints: DataPoint[]
  profit: boolean
}

export function AccountBalanceChart({ dataPoints, profit }: Props) {
  if (dataPoints.length <= 1) {
    return (
      <div className="h-[180px] flex items-center justify-center text-sm text-muted-foreground">
        No trades yet
      </div>
    )
  }

  const color = profit ? '#22c55e' : '#ef4444'

  return (
    <ChartContainer config={config} className="h-[180px] w-full">
      <AreaChart data={dataPoints} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
        <defs>
          <linearGradient id="accountBalanceGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
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
          domain={[
            (dataMin: number) => Math.floor(dataMin * 0.999),
            (dataMax: number) => Math.ceil(dataMax * 1.001),
          ]}
          tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
          tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
          tickLine={false}
          axisLine={false}
          width={52}
        />
        <Tooltip
          labelFormatter={(_, payload) => {
            const point = (payload as { payload?: DataPoint }[] | undefined)?.[0]?.payload
            return point?.date ?? ''
          }}
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
          stroke={color}
          strokeWidth={2}
          fill="url(#accountBalanceGrad)"
          dot={false}
          activeDot={{ r: 4, fill: color }}
        />
      </AreaChart>
    </ChartContainer>
  )
}
