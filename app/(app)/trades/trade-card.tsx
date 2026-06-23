'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { ImageOff, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TradeRow } from '@/types/database'

function formatAmount(n: number) {
  return `${n >= 0 ? '+' : ''}$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

interface TradeCardProps {
  trade: TradeRow
  totalChecklistItems: number
}

export function TradeCard({ trade, totalChecklistItems }: TradeCardProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)

  const accountNames = trade.accounts
    .map((a) => a.account?.name)
    .filter(Boolean)
    .join(', ')
  const typeLabel = trade.challenge_id ? 'Challenge' : accountNames || '—'
  const checkedCount = trade.checked_items.length

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (lightboxOpen) {
      dialog.showModal()
    } else {
      dialog.close()
    }
  }, [lightboxOpen])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const onClose = () => setLightboxOpen(false)
    dialog.addEventListener('close', onClose)
    return () => dialog.removeEventListener('close', onClose)
  }, [])

  function handleBackdropClick(e: React.MouseEvent<HTMLDialogElement>) {
    if (e.target === dialogRef.current) setLightboxOpen(false)
  }

  return (
    <>
      <Card className="h-full flex flex-col">
        {trade.image_url ? (
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="block w-full cursor-zoom-in focus:outline-none"
            aria-label="View screenshot fullscreen"
          >
            <img
              src={trade.image_url}
              alt="Trade screenshot"
              className="w-full aspect-video object-contain object-center rounded-t-xl bg-muted"
            />
          </button>
        ) : (
          <div className="w-full aspect-video bg-muted flex items-center justify-center rounded-t-xl">
            <ImageOff className="size-5 text-muted-foreground/30" />
          </div>
        )}

        <CardContent className="flex flex-col gap-2 pb-4 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {new Date(trade.traded_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
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

          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">{trade.currency}</span>
            <span
              className={`text-sm font-medium tabular-nums ${
                trade.amount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-destructive'
              }`}
            >
              {formatAmount(trade.amount)}
            </span>
          </div>

          <span className="text-xs text-muted-foreground truncate">{typeLabel}</span>

          {(totalChecklistItems > 0 || checkedCount > 0) && (
            <span className="text-xs text-muted-foreground tabular-nums">
              {checkedCount}/{Math.max(checkedCount, totalChecklistItems)} checklist
            </span>
          )}

          <div className="mt-auto pt-2">
            <Link
              href={`/trades/${trade.id}`}
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'w-full')}
            >
              View details
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Lightbox */}
      <dialog
        ref={dialogRef}
        onClick={handleBackdropClick}
        className="fixed inset-0 w-screen h-screen max-w-none max-h-none bg-transparent p-0 backdrop:bg-black/80 backdrop:backdrop-blur-sm"
      >
        <div className="flex items-center justify-center w-full h-full">
          <div className="relative">
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="absolute top-2 right-2 z-10 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80 transition-colors"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
            {trade.image_url && (
              <img
                src={trade.image_url}
                alt="Trade screenshot"
                className="max-w-[95vw] max-h-[95vh] object-contain rounded-xl"
              />
            )}
          </div>
        </div>
      </dialog>
    </>
  )
}
