import { getAccountsWithPnL } from '@/lib/supabase/actions/accounts'
import { getChecklistItems } from '@/lib/supabase/actions/checklist'
import { getActiveChallenge } from '@/lib/supabase/actions/challenge'
import { TradeForm } from './trade-form'
import Link from 'next/link'

export default async function NewTradePage({ searchParams }: { searchParams: Promise<{ type?: string; from?: string }> }) {
  const [accounts, checklistItems, activeChallenge, params] = await Promise.all([
    getAccountsWithPnL(),
    getChecklistItems(),
    getActiveChallenge(),
    searchParams,
  ])

  const defaultType = params.type === 'challenge' ? 'challenge' : 'prop'
  const backHref = params.from === 'challenge' ? '/challenge' : '/trades'
  const backLabel = params.from === 'challenge' ? '← Challenge' : '← Trades'

  return (
    <div className="p-6 max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href={backHref}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {backLabel}
        </Link>
        <h1 className="text-lg font-semibold">New Trade</h1>
      </div>

      <TradeForm
        accounts={accounts.map(({ id, name }) => ({ id, name }))}
        checklistItems={checklistItems}
        activeChallenge={
          activeChallenge
            ? { id: activeChallenge.id, starting_balance: activeChallenge.starting_balance }
            : null
        }
        defaultType={defaultType}
      />
    </div>
  )
}
