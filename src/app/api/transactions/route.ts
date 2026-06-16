import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const transactions = await prisma.transaction.findMany({
    orderBy: { date: 'desc' }
  });
  return NextResponse.json(transactions);
}

export async function POST(request: Request) {
  const body = await request.json();
  
  const transaction = await prisma.transaction.create({
    data: {
      amount: body.amount,
      category: body.category,
      description: body.description,
      type: body.type,
      isRecurring: body.isRecurring,
      // allow overriding date if passed, otherwise defaults to now
      ...(body.date && { date: new Date(body.date) })
    }
  });

  return NextResponse.json(transaction);
}
