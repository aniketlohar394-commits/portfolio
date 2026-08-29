import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = session.user.id;

  try {
    await prisma.$transaction([
      prisma.expense.deleteMany({ where: { userId } }),
      prisma.inventoryItem.deleteMany({ where: { userId } }),
      prisma.shoppingListItem.deleteMany({ where: { userId } }),
      prisma.milkDelivery.deleteMany({ where: { userId } }),
      prisma.milkVendor.deleteMany({ where: { userId } }),
      prisma.budget.deleteMany({ where: { userId } }),
      prisma.reminder.deleteMany({ where: { userId } }),
      // Keep user categories for now or re-create defaults. We'll delete them to be clean.
      prisma.expenseCategory.deleteMany({ where: { userId, isDefault: false } }),
      prisma.inventoryCategory.deleteMany({ where: { userId, isDefault: false } }),
    ]);

    return NextResponse.json({ success: true, message: 'Data reset successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to reset data' }, { status: 500 });
  }
}
