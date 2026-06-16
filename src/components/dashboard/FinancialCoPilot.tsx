'use client';

import { useState, useEffect } from 'react';
import { Sparkles, BrainCircuit, ArrowRight, AlertCircle, X, CheckCircle2 } from 'lucide-react';
import { AIContextPayload } from '@/types/ai';

interface CoPilotProps {
  context: AIContextPayload;
}

export function FinancialCoPilot({ context }: CoPilotProps) {
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);
  const [error, setError] = useState<boolean>(false);
  
  // Tactical Plan State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tacticalLoading, setTacticalLoading] = useState(false);
  const [tacticalPlan, setTacticalPlan] = useState<string[]>([]);
  const [tacticalError, setTacticalError] = useState(false);

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

    const timer = setTimeout(() => {
      fetchInsight();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [context.monthlyIncome, context.fixedExpenses, context.variableExpenses]);

  const handleApplyOptimization = async () => {
    setIsModalOpen(true);
    setTacticalLoading(true);
    setTacticalError(false);
    setTacticalPlan([]);

    try {
      const response = await fetch('/api/copilot/tactical', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(context),
      });

      if (!response.ok) throw new Error('Network error');
      
      const data = await response.json();
      setTacticalPlan(data.plan || []);
    } catch (err) {
      console.error("Failed to load tactical plan", err);
      setTacticalError(true);
    } finally {
      setTacticalLoading(false);
    }
  };

  return (
    <>
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
              
              <button 
                onClick={handleApplyOptimization}
                className="w-full glass-button flex items-center justify-center gap-2 group"
              >
                <span>Aplicar Otimização</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tactical Plan Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-md p-6 relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 mb-6">
              <Sparkles size={24} className="text-accent" />
              <h2 className="text-2xl font-light">Plano Tático</h2>
            </div>

            {tacticalLoading ? (
              <div className="space-y-4 animate-pulse py-4">
                <div className="h-16 bg-white/5 rounded-xl w-full"></div>
                <div className="h-16 bg-white/5 rounded-xl w-full"></div>
                <div className="h-16 bg-white/5 rounded-xl w-full"></div>
                <p className="text-center text-sm text-muted-foreground mt-4">A IA está analisando seu ralo financeiro...</p>
              </div>
            ) : tacticalError ? (
              <div className="py-8 text-center text-red-400">
                <AlertCircle size={32} className="mx-auto mb-4" />
                <p>Falha ao gerar o plano tático. Tente novamente.</p>
              </div>
            ) : (
              <div className="space-y-4 py-2">
                <p className="text-sm text-muted-foreground mb-4">
                  Siga estes 3 passos práticos para atingir o cenário verde (otimizado) na sua projeção estocástica:
                </p>
                {tacticalPlan.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                    <CheckCircle2 size={20} className="text-primary shrink-0 mt-0.5" />
                    <p className="text-sm">{step}</p>
                  </div>
                ))}
                
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="w-full mt-6 bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors"
                >
                  Eu me comprometo a fazer isso hoje
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
