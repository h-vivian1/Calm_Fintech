import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';



export async function POST(req: Request) {
  try {
    const { amount } = await req.json();

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ alert: "Déficit crítico detectado. Reduza seus gastos variáveis imediatamente para manter a liquidez." });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const systemPrompt = `Você é um Co-Piloto Financeiro de Alto Padrão.
O usuário está com um déficit orçamentário crítico (Livre para Gastar: $${amount}).
Escreva APENAS UMA FRASE curta, direta e empática, alertando sobre o risco de liquidez e sugerindo contenção imediata de gastos.
Use tom sóbrio e profissional, sem emojis. Em português brasileiro.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: "Gere a frase de alerta crítico agora.",
        }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.3,
      max_tokens: 60,
    });

    const alert = chatCompletion.choices[0]?.message?.content || "Risco crítico de liquidez detectado. Contenha seus gastos imediatamente.";

    return NextResponse.json({ alert });
  } catch (error) {
    console.error("Groq API Error:", error);
    return NextResponse.json({ error: 'Failed to fetch AI alert' }, { status: 500 });
  }
}
