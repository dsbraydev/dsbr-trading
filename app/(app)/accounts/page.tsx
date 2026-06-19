import { getAccountsWithPnL, createAccount, updateAccount, deleteAccount } from '@/lib/supabase/actions/accounts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AccountItem } from './account-item'

export default async function AccountsPage() {
  const accounts = await getAccountsWithPnL()

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-lg font-semibold mb-1">Prop Firm Accounts</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Add all your funded accounts. A single trade can be placed on multiple accounts.
      </p>

      <form action={createAccount} className="border border-border rounded-xl p-4 mb-6 space-y-3">
        <h2 className="text-sm font-medium">Add account</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="name">Account name</Label>
            <Input id="name" name="name" placeholder="e.g. FTMO 100k" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="starting_balance">Starting balance ($)</Label>
            <Input
              id="starting_balance"
              name="starting_balance"
              type="number"
              step="0.01"
              min="0"
              placeholder="100000"
              required
            />
          </div>
        </div>
        <Button type="submit" size="sm">
          Add account
        </Button>
      </form>

      {accounts.length === 0 ? (
        <p className="text-sm text-muted-foreground">No accounts yet. Add your first account above.</p>
      ) : (
        <ul className="space-y-2">
          {accounts.map((account) => (
            <AccountItem
              key={account.id}
              account={account}
              updateAction={updateAccount}
              deleteAction={deleteAccount}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
