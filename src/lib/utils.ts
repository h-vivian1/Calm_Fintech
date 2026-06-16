import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number, currency = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(value);
}

export function calculateSafeToSpend(
  bankBalance: number,
  expectedIncome: number,
  fixedObligations: number,
  pendingVariables: number,
  savingsGoal: number
): number {
  // S = B_a + I_e - (F_p + O_p + G)
  return bankBalance + expectedIncome - (fixedObligations + pendingVariables + savingsGoal);
}
