'use client';

import { useState, useMemo } from 'react';
import { useLedger } from '@/context/LedgerContext';
import { TransactionCategory } from '@/types/transaction';
import { formatCurrency } from '@/lib/utils';
import { Plus, Trash2, ArrowUpCircle, ArrowDownCircle, Loader2 } from 'lucide-react';
import { parse, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const CATEGORIES: TransactionCategory[] = [
  'Moradia', 'Alimentação', 'Transporte', 'Utilidades', 
  'Seguros', 'Saúde', 'Poupança', 'Pessoal', 
  'Entretenimento', 'Renda'
];

export default function TransactionsPage() {
  const { transactions, addTransaction, removeTransaction, bankBalance, setBankBalance, currentMonth, isLoading } = useLedger();
  
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<TransactionCategory>('Alimentação');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [isRecurring, setIsRecurring] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;
    
    addTransaction({
      amount: Number(amount),
      category,
      description,
      type,
      isRecurring
    });
    
    // Reset form
    setAmount('');
    setDescription('');
    setIsRecurring(false);
  };

  const formattedMonth = useMemo(() => {
    const d = parse(currentMonth, 'yyyy-MM', new Date());
    return format(d, 'MMMM yyyy', { locale: ptBR });
  }, [currentMonth]);

  const monthTransactions = useMemo(() => {
    const [curYear, curMonth] = currentMonth.split('-').map(Number);
    const currentDateMs = new Date(curYear, curMonth - 1, 1).getTime();

    return transactions.filter(t => {
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
  }, [transactions, currentMonth]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <main className="min-h-screen p-4 md:p-8 lg:p-12 max-w-4xl mx-auto space-y-8 pb-24">
      <header className="mb-8">
        <h1 className="text-3xl font-light tracking-tight mb-2">Livro-Razão</h1>
        <p className="text-muted-foreground capitalize">Log do Mês de Referência: <strong className="text-foreground">{formattedMonth}</strong></p>
      </header>

      {/* Manual Initial Balance Adjustment */}
      <section className="glass-panel p-6 mb-8 flex items-center justify-between">
        <div>
          <h3 className="font-medium text-lg">Saldo Bancário Base</h3>
          <p className="text-sm text-muted-foreground">Ajuste seu saldo inicial manualmente, se necessário.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">R$</span>
          <input 
            type="number"
            value={bankBalance}
            onChange={(e) => setBankBalance(Number(e.target.value))}
            className="bg-black/20 border border-white/10 rounded-lg p-2 text-foreground outline-none focus:border-primary transition-colors w-32 text-right"
          />
        </div>
      </section>

      {/* Transaction Form */}
      <section className="glass-panel p-6">
        <h3 className="text-xl font-medium mb-4 flex items-center gap-2">
          <Plus size={20} className="text-primary" />
          Nova Transação
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4 mb-4">
            <button
              type="button"
              onClick={() => { setType('expense'); setCategory('Alimentação'); }}
              className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 transition-colors ${type === 'expense' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-white/5 border border-white/5 text-muted-foreground'}`}
            >
              <ArrowDownCircle size={18} /> Gasto
            </button>
            <button
              type="button"
              onClick={() => { setType('income'); setCategory('Renda'); }}
              className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 transition-colors ${type === 'income' ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-white/5 border border-white/5 text-muted-foreground'}`}
            >
              <ArrowUpCircle size={18} /> Renda
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1 text-sm text-muted-foreground">
              Valor
              <input 
                type="number" 
                required
                min="0.01" step="0.01"
                placeholder="100.00"
                className="bg-black/20 border border-white/10 rounded-lg p-2 text-foreground outline-none focus:border-primary transition-colors"
                value={amount}
                onChange={e => setAmount(e.target.value)}
              />
            </label>
            
            <label className="flex flex-col gap-1 text-sm text-muted-foreground">
              Categoria
              <select 
                className="bg-black/20 border border-white/10 rounded-lg p-2 text-foreground outline-none focus:border-primary transition-colors appearance-none"
                value={category}
                onChange={e => setCategory(e.target.value as TransactionCategory)}
              >
                {type === 'income' ? (
                  <option value="Renda">Renda (Salário, Extra)</option>
                ) : (
                  CATEGORIES.filter(c => c !== 'Renda').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))
                )}
              </select>
            </label>
          </div>

          <label className="flex flex-col gap-1 text-sm text-muted-foreground w-full">
            Descrição
            <input 
              type="text" 
              required
              placeholder="ex. Supermercado, Assinatura Netflix"
              className="bg-black/20 border border-white/10 rounded-lg p-2 text-foreground outline-none focus:border-primary transition-colors"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </label>

          <div className="flex items-center gap-2 mb-2">
            <input 
              type="checkbox" 
              id="recurring" 
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="w-4 h-4 rounded border-white/10 bg-black/20 text-primary focus:ring-primary focus:ring-offset-0"
            />
            <label htmlFor="recurring" className="text-sm text-muted-foreground select-none cursor-pointer">
              {type === 'income' 
                ? `Marcar como Renda Fixa (Salário recorrente). Se desmarcado, a IA calculará a média como Renda Variável.`
                : `Marcar como transação Fixa (recorrente todo mês a partir de ${formattedMonth})`}
            </label>
          </div>

          <button type="submit" className="w-full glass-button mt-4 bg-primary/10 hover:bg-primary/20 text-primary border-primary/20">
            Registrar Transação
          </button>
        </form>
      </section>

      {/* Transaction List */}
      <section className="mt-8">
        <h3 className="text-xl font-medium mb-4">Transações de {formattedMonth}</h3>
        <div className="space-y-3">
          {monthTransactions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Nenhuma transação registrada no mês selecionado.</p>
          ) : (
            monthTransactions.map(t => {
              const txDate = new Date(t.date);
              const txYearMonth = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`;
              const isFromPast = t.isRecurring && txYearMonth !== currentMonth;

              return (
              <div key={t.id} className="glass-panel p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${t.type === 'income' ? 'bg-primary/20 text-primary' : 'bg-red-500/20 text-red-400'}`}>
                    {t.type === 'income' ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{t.description}</p>
                      {t.isRecurring && (
                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">Fixo</span>
                      )}
                      {isFromPast && (
                         <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-muted-foreground border border-white/10">Histórico</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{t.category} • {txDate.toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`font-medium ${t.type === 'income' ? 'text-primary' : 'text-foreground'}`}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                  </span>
                  
                  {!isFromPast && (
                    <button 
                      onClick={() => removeTransaction(t.id)}
                      className="text-muted-foreground hover:text-red-400 transition-colors p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            )})
          )}
        </div>
      </section>
    </main>
  );
}
