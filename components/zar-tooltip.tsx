'use client'

const ZAR_RATE = 16.42

function fmtZar(n: number) {
  return `R${(n * ZAR_RATE).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

interface Props {
  usd: number
  children: React.ReactNode
}

export function ZarTooltip({ usd, children }: Props) {
  return (
    <span className="relative group cursor-default">
      {children}
      <span className="pointer-events-none absolute bottom-full right-0 mb-1.5 hidden group-hover:block whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md z-20">
        {fmtZar(usd)}
      </span>
    </span>
  )
}
