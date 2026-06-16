import { useState, useMemo } from 'react';
import { calculateSafeToSpend } from '@/lib/utils';

interface SafeToSpendState {
  bankBalance: number;
  expectedIncome: number;
  fixedObligations: number;
  pendingVariables: number;
  savingsGoal: number;
}

export function useSafeToSpend(initialState: SafeToSpendState) {
  const [state, setState] = useState<SafeToSpendState>(initialState);

  const safeToSpend = useMemo(() => {
    return calculateSafeToSpend(
      state.bankBalance,
      state.expectedIncome,
      state.fixedObligations,
      state.pendingVariables,
      state.savingsGoal
    );
  }, [state]);

  const updateState = (updates: Partial<SafeToSpendState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  return {
    state,
    safeToSpend,
    updateState
  };
}
