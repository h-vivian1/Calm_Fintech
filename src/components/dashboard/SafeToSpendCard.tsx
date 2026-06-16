'use client';

import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/utils';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

interface SafeToSpendCardProps {
  amount: number;
}

export function SafeToSpendCard({ amount }: SafeToSpendCardProps) {
  const isNegative = amount < 0;
  const [aiAlert, setAiAlert] = useState<string | null>(null);

  useEffect(() => {
    if (isNegative) {
      async function fetchAlert() {
        try {
          const res = await fetch('/api/copilot/alert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount })
          });
          if (res.ok) {
            const data = await res.json();
            setAiAlert(data.alert);
          }
        } catch (e) {
          console.error("Failed to fetch AI alert");
        }
      }
      fetchAlert();
    } else {
      setAiAlert(null);
    }
  }, [amount, isNegative]);

  return (
    <div className={`glass-panel p-8 flex flex-col items-center justify-center text-center relative overflow-hidden group transition-colors duration-500 ${isNegative ? 'border-red-500/20' : ''}`}>
      {/* Subtle animated background glow */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 blur-[80px] rounded-full -z-10 transition-colors duration-700 ${isNegative ? 'bg-red-500/10 group-hover:bg-red-500/20' : 'bg-primary/20 group-hover:bg-primary/30'}`} />
      
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-6 border transition-colors ${isNegative ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-primary/10 border-primary/20 text-primary'}`}>
        {isNegative ? <AlertTriangle size={16} /> : <ShieldCheck size={16} />}
        <span>{isNegative ? 'Risco de Liquidez' : 'Livre para Gastar Hoje'}</span>
      </div>
      
      <h2 className={`text-6xl md:text-7xl font-light tracking-tight drop-shadow-sm transition-colors ${isNegative ? 'text-red-100' : 'text-foreground'}`}>
        {formatCurrency(amount)}
      </h2>
      
      <div className={`mt-4 max-w-sm text-sm transition-colors ${isNegative ? 'text-red-300/80' : 'text-muted-foreground'}`}>
        {isNegative ? (
          <p className="italic leading-relaxed">
            {aiAlert ? `"${aiAlert}"` : "Calculando impacto crítico..."}
          </p>
        ) : (
          <p>
            S = B_a + I_e - (F_p + O_p + G)
            <br/>
            Todas as obrigações e metas de poupança contabilizadas.
          </p>
        )}
      </div>
    </div>
  );
}
