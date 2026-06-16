export interface AIContextPayload {
  monthlyIncome: number;
  fixedExpenses: number;
  variableExpenses: number;
  historicalAverageCategories: Record<string, number>;
  recentAnomalies: { category: string; current: number; average: number }[];
}

export interface AIInsight {
  id: string;
  type: 'warning' | 'suggestion' | 'praise' | 'neutral';
  message: string;
  actionable?: boolean;
  actionText?: string;
}
