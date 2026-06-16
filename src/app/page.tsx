'use client';

import { useMemo } from 'react';
import { useSafeToSpend } from '@/hooks/useSafeToSpend';
import { SafeToSpendCard } from '@/components/dashboard/SafeToSpendCard';
import { ExpenseDonutChart } from '@/components/dashboard/ExpenseDonutChart';
import { FinancialCoPilot } from '@/components/dashboard/FinancialCoPilot';
import { StochasticTimeline } from '@/components/dashboard/StochasticTimeline';
import { Sparkles, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { AIContextPayload } from '@/types/ai';
import { useLedger } from '@/context/LedgerContext';
import { addMonths, subMonths, format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Dashboard() {
  const { transactions, bankBalance, savingsGoal, currentMonth, setCurrentMonth, isLoading } = useLedger();

  // Helper to change month
  const handlePrevMonth = () => {
    const d = parse(currentMonth, 'yyyy-MM', new Date());
    setCurrentMonth(format(subMonths(d, 1), 'yyyy-MM'));
  };

  const handleNextMonth = () => {
    const d = parse(currentMonth, 'yyyy-MM', new Date());
    setCurrentMonth(format(addMonths(d, 1), 'yyyy-MM'));
  };

  const formattedMonth = useMemo(() => {
    const d = parse(currentMonth, 'yyyy-MM', new Date());
    return format(d, 'MMMM yyyy', { locale: ptBR });
  }, [currentMonth]);

  const { expectedIncome, fixedObligations, pendingVariables, currentMonthTransactions } = useMemo(() => {
    let inc = 0;
    let fixed = 0;
    let varExp = 0;

    const [curYear, curMonth] = currentMonth.split('-').map(Number);
    const currentDateMs = new Date(curYear, curMonth - 1, 1).getTime();

    // Filter transactions relevant for the current month
    const relevantTransactions = transactions.filter(t => {
      const txDate = new Date(t.date);
      const txYear = txDate.getFullYear();
      const txMonth = txDate.getMonth() + 1;
      const txDateMs = new Date(txYear, txMonth - 1, 1).getTime();

      // If it's recurring, it's relevant if it started ON OR BEFORE the current month.
      if (t.isRecurring) {
        return txDateMs <= currentDateMs;
      }
      
      // If not recurring, it must be exactly in this month
      return txYear === curYear && txMonth === curMonth;
    });

    relevantTransactions.forEach(t => {
      if (t.type === 'income') {
        inc += t.amount;
      } else {
        if (t.isRecurring) {
          fixed += t.amount;
        } else {
          varExp += t.amount;
        }
      }
    });

    return { 
      expectedIncome: inc, 
      fixedObligations: fixed, 
      pendingVariables: varExp,
      currentMonthTransactions: relevantTransactions
    };
  }, [transactions, currentMonth]);

  const { safeToSpend } = useSafeToSpend({
    bankBalance,
    expectedIncome,
    fixedObligations,
    pendingVariables,
    savingsGoal,
  });

  const aiContext: AIContextPayload = {
    monthlyIncome: expectedIncome,
    fixedExpenses: fixedObligations,
    variableExpenses: pendingVariables,
    historicalAverageCategories: { 'Moradia': 2400, 'Alimentação': 600 },
    recentAnomalies: [
      { category: 'Alimentação', current: pendingVariables, average: 600 }
    ]
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <main className="min-h-screen p-4 md:p-8 lg:p-12 max-w-7xl mx-auto space-y-8 pb-24">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <h1 className="text-3xl font-light tracking-tight mb-2">Gestão de Patrimônio</h1>
          <p className="text-muted-foreground">Previsibilidade calma e algorítmica para suas finanças.</p>
        </div>
        
        {/* Month Selector */}
        <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-full px-2 py-1">
          <button onClick={handlePrevMonth} className="p-2 hover:bg-white/10 rounded-full transition-colors text-muted-foreground hover:text-foreground">
            <ChevronLeft size={20} />
          </button>
          <span className="w-32 text-center font-medium capitalize text-sm">
            {formattedMonth}
          </span>
          <button onClick={handleNextMonth} className="p-2 hover:bg-white/10 rounded-full transition-colors text-muted-foreground hover:text-foreground">
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full border border-primary/20 text-sm">
          <Sparkles size={16} />
          <span>Motor de IA Ativo</span>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full">
        <SafeToSpendCard amount={safeToSpend} />
      </section>

      {/* Analytics Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="col-span-1 lg:col-span-1">
          <ExpenseDonutChart transactions={currentMonthTransactions} />
        </div>
        <div className="col-span-1 lg:col-span-2">
          <StochasticTimeline 
            transactions={currentMonthTransactions}
            bankBalance={bankBalance}
            expectedIncome={expectedIncome}
            fixedObligations={fixedObligations}
            pendingVariables={pendingVariables}
          />
        </div>
      </section>

      {/* Co-Pilot Section */}
      <section className="w-full">
        <FinancialCoPilot context={aiContext} />
      </section>
    </main>
  );
}
