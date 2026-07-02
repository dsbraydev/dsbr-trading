'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { createTrade, updateTrade } from '@/lib/supabase/actions/trades'
import type { ChecklistItem } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface AccountOption {
  id: string
  name: string
}

export interface TradeInitialValues {
  currency: 'NAS100' | 'Gold' | 'US30'
  win: boolean
  amount: number
  type: 'prop' | 'challenge'
  accountIds: string[]
  checkedItemIds: string[]
  notes: string
  existingImageUrl: string | null
  tradedAt: string
}

interface Props {
  accounts: AccountOption[]
  checklistItems: ChecklistItem[]
  activeChallenge: { id: string; starting_balance: number } | null
  tradeId?: string
  initialValues?: TradeInitialValues
  defaultType?: TradeType
}

type Currency = 'NAS100' | 'Gold' | 'US30'
type TradeType = 'prop' | 'challenge'

export function TradeForm({ accounts, checklistItems, activeChallenge, tradeId, initialValues, defaultType }: Props) {
  const router = useRouter()
  const isEdit = !!tradeId

  const [currency, setCurrency] = useState<Currency>(initialValues?.currency ?? 'NAS100')
  const [win, setWin] = useState(initialValues?.win ?? true)
  const [type, setType] = useState<TradeType>(initialValues?.type ?? defaultType ?? 'prop')
  const [amount, setAmount] = useState(initialValues ? String(initialValues.amount) : '')
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>(initialValues?.accountIds ?? [])
  const [checkedItems, setCheckedItems] = useState<string[]>(initialValues?.checkedItemIds ?? [])
  const [notes, setNotes] = useState(initialValues?.notes ?? '')
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(initialValues?.existingImageUrl ?? null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [tradedAtValue, setTradedAtValue] = useState(
    initialValues?.tradedAt ?? new Date().toISOString().slice(0, 16),
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggleAccount(id: string) {
    setSelectedAccounts((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]))
  }

  function toggleItem(id: string) {
    setCheckedItems((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview)
    }
  }, [imagePreview])

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('File must be an image.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be under 10 MB.')
      return
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setExistingImageUrl(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Enter a valid amount greater than 0')
      return
    }
    if (type === 'prop' && selectedAccounts.length === 0) {
      setError('Select at least one account')
      return
    }
    if (type === 'challenge' && !activeChallenge) {
      setError('No active challenge. Start one on the Challenge page first.')
      return
    }

    setLoading(true)

    let imageUrl: string | null = existingImageUrl

    if (imageFile) {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const ext = imageFile.name.split('.').pop() ?? 'jpg'
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('trade-images')
          .upload(path, imageFile)
        if (!uploadError) {
          const { data } = supabase.storage.from('trade-images').getPublicUrl(path)
          imageUrl = data.publicUrl
        }
      }
    }

    const input = {
      currency,
      win,
      amount: amountNum,
      accountIds: type === 'prop' ? selectedAccounts : [],
      challengeId: type === 'challenge' ? (activeChallenge?.id ?? null) : null,
      checkedItemIds: checkedItems,
      notes: notes.trim() || null,
      imageUrl,
      tradedAt: new Date(tradedAtValue).toISOString(),
    }

    const result = isEdit ? await updateTrade(tradeId, input) : await createTrade(input)

    setLoading(false)

    if ('error' in result && result.error) {
      setError(result.error)
      return
    }

    if (isEdit) {
      router.push(`/trades/${tradeId}`)
    } else {
      router.push('/trades')
    }
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Currency */}
      <div className="space-y-2">
        <Label>Currency</Label>
        <div className="flex gap-2">
          {(['NAS100', 'Gold', 'US30'] as Currency[]).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCurrency(c)}
              className={cn(
                'px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors',
                currency === c
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border bg-background text-foreground hover:bg-muted',
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Win / Loss */}
      <div className="space-y-2">
        <Label>Result</Label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setWin(true)}
            className={cn(
              'px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors',
              win
                ? 'bg-green-600 text-white border-green-600'
                : 'border-border bg-background text-foreground hover:bg-muted',
            )}
          >
            Win
          </button>
          <button
            type="button"
            onClick={() => setWin(false)}
            className={cn(
              'px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors',
              !win
                ? 'bg-destructive text-white border-destructive'
                : 'border-border bg-background text-foreground hover:bg-muted',
            )}
          >
            Loss
          </button>
        </div>
      </div>

      {/* Amount */}
      <div className="space-y-1.5">
        <Label htmlFor="amount">Amount ($)</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="max-w-48"
        />
        <p className="text-xs text-muted-foreground">
          Recorded as {win ? 'positive (profit)' : 'negative (loss)'}.
        </p>
      </div>

      {/* Type */}
      <div className="space-y-2">
        <Label>Trade type</Label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setType('prop')}
            className={cn(
              'px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors',
              type === 'prop'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border bg-background text-foreground hover:bg-muted',
            )}
          >
            Prop Firm
          </button>
          <button
            type="button"
            onClick={() => setType('challenge')}
            className={cn(
              'px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors',
              type === 'challenge'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border bg-background text-foreground hover:bg-muted',
            )}
          >
            Challenge
          </button>
        </div>
      </div>

      {/* Accounts */}
      {type === 'prop' && (
        <div className="space-y-2">
          <Label>Accounts</Label>
          {accounts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No accounts yet.{' '}
              <Link href="/accounts" className="underline">
                Add one first.
              </Link>
            </p>
          ) : (
            <div className="space-y-2.5">
              {accounts.map((account) => (
                <label key={account.id} className="flex items-center gap-2.5 cursor-pointer">
                  <Checkbox
                    checked={selectedAccounts.includes(account.id)}
                    onCheckedChange={() => toggleAccount(account.id)}
                  />
                  <span className="text-sm">{account.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Challenge */}
      {type === 'challenge' && (
        <div className="space-y-1.5">
          <Label>Challenge</Label>
          {activeChallenge ? (
            <p className="text-sm text-muted-foreground">
              Auto-linked to active challenge (start balance: $
              {activeChallenge.starting_balance.toLocaleString('en-US', { minimumFractionDigits: 2 })})
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              No active challenge.{' '}
              <Link href="/challenge" className="underline">
                Start one first.
              </Link>
            </p>
          )}
        </div>
      )}

      {/* Checklist */}
      {checklistItems.length > 0 && (
        <div className="space-y-2">
          <Label>
            Checklist{' '}
            <span className="text-muted-foreground font-normal">
              ({checkedItems.length}/{checklistItems.length} checked)
            </span>
          </Label>
          <div className="space-y-2.5">
            {checklistItems.map((item) => (
              <label key={item.id} className="flex items-center gap-2.5 cursor-pointer">
                <Checkbox
                  checked={checkedItems.includes(item.id)}
                  onCheckedChange={() => toggleItem(item.id)}
                />
                <span className="text-sm">{item.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="What were you thinking? What did you see?"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {/* Screenshot */}
      <div className="space-y-1.5">
        <Label htmlFor="screenshot">Screenshot</Label>
        {existingImageUrl && !imagePreview && (
          <img
            src={existingImageUrl}
            alt="Current screenshot"
            className="max-h-40 rounded-lg border border-border object-contain mb-2"
          />
        )}
        {imagePreview && (
          <img
            src={imagePreview}
            alt="New screenshot preview"
            className="max-h-40 rounded-lg border border-border object-contain mb-2"
          />
        )}
        <Input
          id="screenshot"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="cursor-pointer"
        />
        {existingImageUrl && (
          <p className="text-xs text-muted-foreground">Upload a new file to replace the existing screenshot.</p>
        )}
      </div>

      {/* Date & Time */}
      <div className="space-y-1.5">
        <Label htmlFor="traded_at">Date & time</Label>
        <Input
          id="traded_at"
          type="datetime-local"
          value={tradedAtValue}
          onChange={(e) => setTradedAtValue(e.target.value)}
          className="max-w-56"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? (isEdit ? 'Saving…' : 'Logging…') : isEdit ? 'Save changes' : 'Log trade'}
        </Button>
        <Link
          href={isEdit ? `/trades/${tradeId}` : '/trades'}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancel
        </Link>
      </div>
    </form>
  )
}
