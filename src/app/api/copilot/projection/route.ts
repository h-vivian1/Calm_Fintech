import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { Transaction } from '@/types/transaction';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { transactions } = await req.json() as { transactions: Transaction[] };

    if (!transactions || transactions.length === 0) {
      return NextResponse.json({ expectedVariableIncome: 0, expectedVariableExpenses: 0 });
    }

    // Filter variable transactions (non-recurring)
    const variableIncome = transactions.filter(t => t.type === 'income' && !t.isRecurring);
    const variableExpenses = transactions.filter(t => t.type === 'expense' && !t.isRecurring);

    // If there is very little data, just do a simple average to save tokens, but we promised AI processing
    const summaryData = {
      historicalVariableIncomes: variableIncome.map(t => ({ amount: t.amount, date: t.date })),
      historicalVariableExpenses: variableExpenses.map(t => ({ amount: t.amount, date: t.date }))
    };

    const systemPrompt = `Você é um motor preditivo financeiro para uma aplicação Calm Fintech.
Seu objetivo é analisar o histórico de ganhos e gastos VARIÁVEIS (não-fixos) do usuário e calcular uma "Média Mensal Esperada" conservadora para o futuro.
Retorne EXATAMENTE UM JSON, sem formatação markdown ou texto extra.

Formato esperado:
{
  "expectedVariableIncome": numero,
  "expectedVariableExpenses": numero
}

Regras:
1. Seja conservador. Se o usuário teve um pico de ganho anômalo, suavize-o.
2. Se não houver dados suficientes, retorne 0.
3. Não retorne NADA ALÉM DO JSON VALIDO.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Analise esses dados históricos e retorne a projeção JSON: ${JSON.stringify(summaryData)}`,
        }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.1,
      response_format: { type: "json_object" },
    });

    const content = chatCompletion.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);

    return NextResponse.json({ 
      expectedVariableIncome: parsed.expectedVariableIncome || 0,
      expectedVariableExpenses: parsed.expectedVariableExpenses || 0
    });
  } catch (error) {
    console.error("Groq API Error:", error);
    return NextResponse.json({ error: 'Failed to fetch AI projection' }, { status: 500 });
  }
}
