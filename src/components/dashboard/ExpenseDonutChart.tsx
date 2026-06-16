'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { Transaction } from '@/types/transaction';
import { useMemo } from 'react';

const CATEGORY_COLORS: Record<string, string> = {
  'Moradia': '#3b82f6',
  'Alimentação': '#10b981',
  'Transporte': '#8b5cf6',
  'Utilidades': '#f59e0b',
  'Seguros': '#64748b',
  'Saúde': '#ef4444',
  'Pessoal': '#0ea5e9',
  'Entretenimento': '#ec4899',
  'Poupança': '#14b8a6',
  'Outros': '#94a3b8'
};

interface ExpenseDonutChartProps {
  transactions?: Transaction[];
}

export function ExpenseDonutChart({ transactions = [] }: ExpenseDonutChartProps) {
  
  const { data, totalExpense } = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const grouped = expenses.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    const mappedData = Object.entries(grouped)
      .map(([name, value]) => ({
        name,
        value,
        color: CATEGORY_COLORS[name] || CATEGORY_COLORS['Outros']
      }))
      .sort((a, b) => b.value - a.value); // Sort largest to smallest

    const total = mappedData.reduce((sum, item) => sum + item.value, 0);

    return { data: mappedData, totalExpense: total };
  }, [transactions]);

  return (
    <div className="glass-panel p-6 h-[400px] flex flex-col">
      <div className="mb-4 flex justify-between items-end">
        <div>
          <h3 className="text-xl font-medium">Ralo Financeiro</h3>
          <p className="text-sm text-muted-foreground">Clique para revelar os micro-gastos</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-light text-foreground block">{formatCurrency(totalExpense)}</span>
          <span className="text-xs text-muted-foreground uppercase tracking-widest">Total Gasto</span>
        </div>
      </div>
      
      <div className="flex-1 relative">
        {data.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm text-center">
            Adicione seus gastos na aba de <br/>Transações para ver o resumo.
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 17, 26, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(8px)' }}
                  itemStyle={{ color: '#f8fafc' }}
                  formatter={(value: any) => formatCurrency(Number(value))}
                />
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                  isAnimationActive={true}
                  animationBegin={0}
                  animationDuration={1500}
                  animationEasing="ease-in-out"
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                      className="hover:opacity-80 transition-opacity cursor-pointer outline-none"
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </>
        )}
      </div>
    </div>
  );
}
