import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    let settings = await prisma.settings.findUnique({
      where: { id: 'default' }
    });

    if (!settings) {
      settings = await prisma.settings.create({
        data: { id: 'default', bankBalance: 0, savingsGoal: 0 }
      });
    }

    return NextResponse.json(settings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  
  const settings = await prisma.settings.upsert({
    where: { id: 'default' },
    update: {
      bankBalance: body.bankBalance,
      savingsGoal: body.savingsGoal,
    },
    create: {
      id: 'default',
      bankBalance: body.bankBalance ?? 0,
      savingsGoal: body.savingsGoal ?? 0,
    }
  });

  return NextResponse.json(settings);
}
