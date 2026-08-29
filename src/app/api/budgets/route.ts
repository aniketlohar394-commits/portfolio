import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const month = parseInt(searchParams.get('month') || new Date().getMonth().toString());
  const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());

  try {
    const budget = await prisma.budget.findUnique({
      where: {
        userId_month_year: {
          userId: session.user.id,
          month,
          year,
        }
      },
      include: {
        categoryBudgets: {
          include: {
            category: true,
          }
        }
      }
    });
    return NextResponse.json(budget || { totalBudget: 0, categoryBudgets: [] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch budget' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const data = await req.json();
    const { totalBudget, month, year, categoryBudgets } = data;

    const budget = await prisma.$transaction(async (tx) => {
      const b = await tx.budget.upsert({
        where: {
          userId_month_year: { userId: session.user.id, month, year }
        },
        update: { totalBudget },
        create: { totalBudget, month, year, userId: session.user.id }
      });

      if (categoryBudgets && categoryBudgets.length > 0) {
        // Clear old ones
        await tx.categoryBudget.deleteMany({
          where: { budgetId: b.id }
        });
        
        // Add new ones
        for (const cb of categoryBudgets) {
          await tx.categoryBudget.create({
            data: {
              budgetId: b.id,
              categoryId: cb.categoryId,
              amount: cb.amount,
            }
          });
        }
      }
      return b;
    });
    
    return NextResponse.json(budget);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to save budget' }, { status: 500 });
  }
}
