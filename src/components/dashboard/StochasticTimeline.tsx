'use client';

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { Transaction } from '@/types/transaction';
import { useMemo, useState, useEffect } from 'react';
import { addMonths, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface StochasticTimelineProps {
  transactions?: Transaction[];
  bankBalance?: number;
  expectedIncome?: number;
  fixedObligations?: number;
  pendingVariables?: number;
}

export function StochasticTimeline({
  transactions = [],
  bankBalance = 0,
  expectedIncome = 0,
  fixedObligations = 0,
  pendingVariables = 0
}: StochasticTimelineProps) {
  const [aiProjection, setAiProjection] = useState({ income: 0, expenses: 0 });

  useEffect(() => {
    if (transactions.length > 0) {
      fetch('/api/copilot/projection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactions })
      })
      .then(res => res.json())
      .then(data => {
        setAiProjection({
          income: data.expectedVariableIncome || 0,
          expenses: data.expectedVariableExpenses || 0
        });
      })
      .catch(() => {});
    }
  }, [transactions]);

  const data = useMemo(() => {
    if (transactions.length === 0 && bankBalance === 0) return [];

    const projection = [];
    let currentBal = bankBalance;
    let optBal = bankBalance;
    
    // Baseline monthly net uses AI predicted variables instead of just current month's pending
    const monthlyNet = expectedIncome + aiProjection.income - fixedObligations - aiProjection.expenses;
    // Optimized: 5% more income, 10% less fixed/var expenses
    const optNet = ((expectedIncome + aiProjection.income) * 1.05) - (fixedObligations * 0.9) - (aiProjection.expenses * 0.9);

    const now = new Date();

    for (let i = 0; i < 12; i++) {
      const monthDate = addMonths(now, i);
      const monthLabel = format(monthDate, 'MMM', { locale: ptBR });
      
      projection.push({
        month: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1),
        current: Math.max(0, currentBal),
        optimized: Math.max(0, optBal)
      });

      currentBal += monthlyNet;
      optBal += optNet;
    }

    return projection;
  }, [transactions.length, bankBalance, expectedIncome, fixedObligations, pendingVariables, aiProjection]);

  return (
    <div className="glass-panel p-6 h-[400px] flex flex-col">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h3 className="text-xl font-medium mb-1">Projeção Estocástica de Patrimônio</h3>
          <p className="text-sm text-muted-foreground">Trajetória Atual vs. Cenário Otimizado (12 Meses)</p>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-muted-foreground">Otimizado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-slate-500" />
            <span className="text-muted-foreground">Atual</span>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full relative">
        {data.length === 0 ? (
           <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm text-center">
             Nenhuma transação e saldo zerado.<br/>Registre seu saldo ou adicione transações para ver a projeção.
           </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorOptimized" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#64748b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#64748b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="month" 
                stroke="rgba(255,255,255,0.1)" 
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.1)" 
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `R$${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(15, 17, 26, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(8px)' }}
                itemStyle={{ color: '#f8fafc' }}
                labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                formatter={(value: any) => formatCurrency(Number(value))}
              />
              <Area 
                type="monotone" 
                dataKey="optimized" 
                stroke="#10b981" 
                fillOpacity={1} 
                fill="url(#colorOptimized)" 
                strokeWidth={2}
                animationDuration={2000}
              />
              <Area 
                type="monotone" 
                dataKey="current" 
                stroke="#64748b" 
                fillOpacity={1} 
                fill="url(#colorCurrent)" 
                strokeWidth={2}
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
