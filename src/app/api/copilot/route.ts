import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { AIContextPayload } from '@/types/ai';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const payload: AIContextPayload = await req.json();

    const systemPrompt = `Você é um Co-Piloto Financeiro de Alto Padrão (Calm Fintech).
Responda sempre em português brasileiro de forma ultra-concisa (máximo 2 frases), focando em reduzir a carga cognitiva do usuário.
Seu objetivo é analisar as finanças expurgadas e oferecer um único insight preditivo.
NUNCA use formatação excessiva.
Os dados do usuário são:
- Renda esperada: $${payload.monthlyIncome}
- Obrigações Fixas: $${payload.fixedExpenses}
- Gastos Variáveis: $${payload.variableExpenses}
- Anomalias recentes: ${JSON.stringify(payload.recentAnomalies)}`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: "Analise meu fluxo de caixa e me dê um insight preditivo acionável e calmo sobre minha situação atual.",
        }
      ],
      model: "llama-3.1-8b-instant", // Using a fast, reliable model on Groq
      temperature: 0.2,
      max_tokens: 150,
    });

    const insight = chatCompletion.choices[0]?.message?.content || "Seu ecossistema financeiro está estável. Nenhuma anomalia crítica detectada.";

    return NextResponse.json({ insight });
  } catch (error) {
    console.error("Groq API Error:", error);
    return NextResponse.json({ error: 'Failed to fetch AI insight' }, { status: 500 });
  }
}
