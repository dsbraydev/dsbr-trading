export type Currency = 'NAS100' | 'Gold'
export type ChallengeStatus = 'active' | 'cancelled'

export interface ChecklistItem {
  id: string
  user_id: string
  name: string
  display_order: number
  created_at: string
}

export interface Challenge {
  id: string
  user_id: string
  starting_balance: number
  status: ChallengeStatus
  created_at: string
}

export interface Account {
  id: string
  user_id: string
  name: string
  starting_balance: number
  created_at: string
}

export interface Trade {
  id: string
  user_id: string
  currency: Currency
  win: boolean
  amount: number
  notes: string | null
  image_url: string | null
  challenge_id: string | null
  traded_at: string
  created_at: string
}

export interface TradeRow extends Trade {
  challenge: Pick<Challenge, 'id' | 'starting_balance'> | null
  accounts: Array<{ account: Pick<Account, 'id' | 'name'> | null }>
  checked_items: Array<{ checklist_item_id: string }>
}

export interface TradeDetail extends Trade {
  challenge: Pick<Challenge, 'id' | 'starting_balance'> | null
  accounts: Array<{ account: Pick<Account, 'id' | 'name'> | null }>
  checked_items: Array<{ checklist_item: Pick<ChecklistItem, 'id' | 'name'> | null }>
}

export interface AccountWithPnL extends Account {
  pnl: number
}

export interface ChallengeWithTrades extends Challenge {
  trades: Pick<Trade, 'id' | 'currency' | 'win' | 'amount' | 'traded_at'>[]
}

export interface CreateTradeInput {
  currency: Currency
  win: boolean
  amount: number
  accountIds: string[]
  challengeId: string | null
  checkedItemIds: string[]
  notes: string | null
  imageUrl: string | null
  tradedAt: string
}
