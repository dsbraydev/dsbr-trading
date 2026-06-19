'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Pencil, Trash2, Check, X } from 'lucide-react'
import type { AccountWithPnL } from '@/types/database'

interface Props {
  account: AccountWithPnL
  updateAction: (id: string, formData: FormData) => Promise<void>
  deleteAction: (id: string) => Promise<void>
}

function formatAmount(n: number) {
  return `${n >= 0 ? '+' : ''}$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function AccountItem({ account, updateAction, deleteAction }: Props) {
  const [editing, setEditing] = useState(false)
  const [isPending, startTransition] = useTransition()

  const balance = account.starting_balance + account.pnl

  function handleSave(formData: FormData) {
    startTransition(async () => {
      await updateAction(account.id, formData)
      setEditing(false)
    })
  }

  const deleteWithId = deleteAction.bind(null, account.id)

  if (!editing) {
    return (
      <li className="flex items-center justify-between px-4 py-3 rounded-xl border border-border bg-card">
        <div>
          <p className="text-sm font-medium">{account.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Start: ${account.starting_balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            {' · '}
            Balance: ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`text-sm font-medium tabular-nums ${account.pnl >= 0 ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}
          >
            {formatAmount(account.pnl)}
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            type="button"
            onClick={() => setEditing(true)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Pencil className="size-3.5" />
          </Button>
          <form action={deleteWithId}>
            <Button
              variant="ghost"
              size="icon-sm"
              type="submit"
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </form>
        </div>
      </li>
    )
  }

  return (
    <li className="px-4 py-3 rounded-xl border border-primary/40 bg-card">
      <form action={handleSave} className="flex items-center gap-2">
        <Input
          name="name"
          defaultValue={account.name}
          className="flex-1 h-7 text-sm"
          autoFocus
          required
        />
        <Input
          name="starting_balance"
          type="number"
          step="0.01"
          min="0"
          defaultValue={account.starting_balance}
          className="w-32 h-7 text-sm"
          required
        />
        <Button size="icon-sm" type="submit" disabled={isPending}>
          <Check className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          type="button"
          onClick={() => setEditing(false)}
          disabled={isPending}
        >
          <X className="size-3.5" />
        </Button>
      </form>
    </li>
  )
}
