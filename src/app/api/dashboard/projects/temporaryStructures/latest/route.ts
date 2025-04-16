// app/api/dashboard/projects/temporaryStructures/latest/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const latestCalculation = await prisma.calculation.findFirst({
      orderBy: {
        calculatedAt: 'desc'
      },
      include: {
        structures: true
      }
    });

    return NextResponse.json(latestCalculation);
  } catch (error) {
    console.error('Error fetching latest calculation:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}