'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Transaction } from '@/types/transaction';

interface LedgerContextType {
  transactions: Transaction[];
  addTransaction: (t: Omit<Transaction, 'id' | 'date'>) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
  bankBalance: number;
  setBankBalance: (v: number) => Promise<void>;
  savingsGoal: number;
  setSavingsGoal: (v: number) => Promise<void>;
  currentMonth: string;
  setCurrentMonth: (m: string) => void;
  isLoading: boolean;
}

const LedgerContext = createContext<LedgerContextType | undefined>(undefined);

export function LedgerProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bankBalance, setBankBalance] = useState<number>(0);
  const [savingsGoal, setSavingsGoal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // Format: "YYYY-MM"
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [txRes, setRes] = await Promise.all([
          fetch('/api/transactions'),
          fetch('/api/settings')
        ]);
        
        if (txRes.ok) {
          const data = await txRes.json();
          setTransactions(data);
        }
        
        if (setRes.ok) {
          const data = await setRes.json();
          setBankBalance(data.bankBalance);
          setSavingsGoal(data.savingsGoal);
        }
      } catch (e) {
        console.error("Failed to load data", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const saveSettings = async (bb: number, sg: number) => {
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bankBalance: bb, savingsGoal: sg })
    });
  };

  const handleSetBankBalance = async (v: number) => {
    setBankBalance(v);
    await saveSettings(v, savingsGoal);
  };

  const handleSetSavingsGoal = async (v: number) => {
    setSavingsGoal(v);
    await saveSettings(bankBalance, v);
  };

  const addTransaction = async (t: Omit<Transaction, 'id' | 'date'>) => {
    // If we are looking at a past/future month, we should log the transaction as happening in that month
    // so the user doesn't get confused.
    const [year, month] = currentMonth.split('-');
    const txDate = new Date(Number(year), Number(month) - 1, 15).toISOString();

    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...t, date: txDate })
    });
    if (res.ok) {
      const newTx = await res.json();
      setTransactions(prev => [newTx, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }
  };

  const removeTransaction = async (id: string) => {
    const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  return (
    <LedgerContext.Provider value={{
      transactions, addTransaction, removeTransaction,
      bankBalance, setBankBalance: handleSetBankBalance,
      savingsGoal, setSavingsGoal: handleSetSavingsGoal,
      currentMonth, setCurrentMonth,
      isLoading
    }}>
      {children}
    </LedgerContext.Provider>
  );
}

export function useLedger() {
  const context = useContext(LedgerContext);
  if (!context) throw new Error("useLedger must be used within a LedgerProvider");
  return context;
}
