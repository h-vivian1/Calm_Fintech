import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { AIContextPayload } from '@/types/ai';

export async function POST(req: Request) {
  try {
    const payload: AIContextPayload = await req.json();

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ 
        plan: [
          "1. Congele gastos com Alimentação fora de casa imediatamente.",
          "2. Guarde R$ 50 do seu saldo livre hoje para criar margem de segurança.",
          "3. Revise assinaturas inativas no próximo fim de semana."
        ]
      });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const systemPrompt = `Você é um Estrategista Financeiro Tático.
O usuário quer aplicar uma "Otimização" para atingir seu cenário verde (reduzir gastos em 10% e focar em liquidez).
Com base nos dados abaixo, retorne EXATAMENTE UM JSON com um array de 3 strings, sendo cada string um passo prático, cirúrgico e factível para ele fazer HOJE.
Exemplo de formato:
{
  "plan": [
    "1. Cancele o serviço X.",
    "2. Guarde R$ Y hoje.",
    "3. Substitua gasto Z."
  ]
}
Não escreva NADA além do JSON válido.

Dados:
- Renda: $${payload.monthlyIncome}
- Fixos: $${payload.fixedExpenses}
- Variáveis: $${payload.variableExpenses}
- Anomalias: ${JSON.stringify(payload.recentAnomalies)}`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: "Gere o plano tático de 3 passos em JSON.",
        }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    const content = chatCompletion.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);

    return NextResponse.json({ 
      plan: parsed.plan || [
        "1. Analise seus gastos variáveis mais altos.",
        "2. Identifique e corte uma assinatura não essencial.",
        "3. Transfira 10% do seu saldo livre para poupança."
      ]
    });
  } catch (error) {
    console.error("Groq API Error:", error);
    return NextResponse.json({ error: 'Failed to fetch tactical plan' }, { status: 500 });
  }
}
