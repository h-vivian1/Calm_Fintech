export type TransactionCategory = 
  | 'Moradia' 
  | 'Alimentação' 
  | 'Transporte' 
  | 'Utilidades' 
  | 'Seguros' 
  | 'Saúde' 
  | 'Poupança' 
  | 'Pessoal' 
  | 'Entretenimento'
  | 'Renda';

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  category: TransactionCategory;
  description: string;
  isRecurring: boolean;
  type: 'income' | 'expense';
}

export interface Projection {
  date: string;
  expectedBalance: number;
  optimizedBalance: number;
}
