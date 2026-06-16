'use client';

import { useState, useEffect } from 'react';
import { Sparkles, BrainCircuit, ArrowRight, AlertCircle } from 'lucide-react';
import { AIContextPayload } from '@/types/ai';

interface CoPilotProps {
  context: AIContextPayload;
}

export function FinancialCoPilot({ context }: CoPilotProps) {
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    async function fetchInsight() {
      setLoading(true);
      setError(false);
      try {
        const response = await fetch('/api/copilot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(context),
        });

        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        setInsight(data.insight);
      } catch (err) {
        console.error("Failed to load insight", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    // Debounce or only fetch when context meaningfully changes
    const timer = setTimeout(() => {
      fetchInsight();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [context.monthlyIncome, context.fixedExpenses, context.variableExpenses]);

  return (
    <div className="glass-panel p-6 h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 blur-[50px] rounded-full -z-10" />
      
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-accent/20 rounded-lg text-accent">
          <BrainCircuit size={20} />
        </div>
        <h3 className="text-xl font-medium">Co-Piloto Financeiro</h3>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-4 bg-white/5 rounded w-3/4"></div>
            <div className="h-4 bg-white/5 rounded w-full"></div>
            <div className="h-4 bg-white/5 rounded w-5/6"></div>
          </div>
        ) : error ? (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <p className="text-sm">Erro ao conectar ao motor preditivo. Tente novamente mais tarde.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/5">
              <Sparkles size={18} className="text-accent shrink-0 mt-0.5" />
              <p className="text-sm leading-relaxed text-foreground">
                {insight}
              </p>
            </div>
            
            <button className="w-full glass-button flex items-center justify-center gap-2 group">
              <span>Aplicar Otimização</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
