export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
}

export interface LedgerEntry {
  id: string;
  transactionId: string;
  accountId: string;
  amount: number; // Positive for debits, negative for credits in normal accounting, or signed according to type
  date: string;
  description: string;
}
