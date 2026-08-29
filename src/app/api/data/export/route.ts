import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });

  const userId = session.user.id;
  
  const [
    expenses, inventory, shoppingList, milkDeliveries, budgets, settings
  ] = await Promise.all([
    prisma.expense.findMany({ where: { userId }, include: { category: true } }),
    prisma.inventoryItem.findMany({ where: { userId }, include: { category: true } }),
    prisma.shoppingListItem.findMany({ where: { userId } }),
    prisma.milkDelivery.findMany({ where: { userId }, include: { vendor: true } }),
    prisma.budget.findMany({ where: { userId }, include: { categoryBudgets: true } }),
    prisma.userSettings.findUnique({ where: { userId } })
  ]);

  const data = {
    expenses, inventory, shoppingList, milkDeliveries, budgets, settings
  };

  const { searchParams } = new URL(req.url);
  const format = searchParams.get('format');

  if (format === 'csv') {
    // Basic CSV generation for expenses
    const header = 'ID,Name,Amount,Date,Category,PaymentMethod,Notes\n';
    const rows = expenses.map(e => {
      const name = e.name.replace(/,/g, '');
      const notes = (e.notes || '').replace(/,/g, '');
      const cat = e.category?.name || '';
      return `${e.id},${name},${e.amount},${e.date},${cat},${e.paymentMethod},${notes}`;
    }).join('\n');
    return new NextResponse(header + rows, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="homemate-expenses.csv"'
      }
    });
  }

  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="homemate-export.json"'
    }
  });
}
