import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getDaysInMonth } from '@/lib/utils';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const month = parseInt(searchParams.get('month') || new Date().getMonth().toString());
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());

    const startDate = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));

    const deliveries = await prisma.milkDelivery.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const activeVendor = await prisma.milkVendor.findFirst({
      where: { userId: session.user.id, isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    const daysInMonth = getDaysInMonth(year, month);
    let daysDelivered = 0;
    let daysNotDelivered = 0;
    let totalQuantity = 0;
    let totalSpent = 0;

    for (const d of deliveries) {
      if (d.status === 'delivered') {
        daysDelivered++;
        totalQuantity += d.quantity;
        totalSpent += d.totalAmount;
      } else if (d.status === 'not_delivered' || d.status === 'skipped') {
        daysNotDelivered++;
      }
    }

    const averageDaily = daysDelivered > 0 ? (totalQuantity / daysDelivered).toFixed(1) : 0;

    return NextResponse.json({
      daysInMonth,
      daysDelivered,
      daysNotDelivered,
      totalQuantity,
      totalSpent,
      averageDaily: Number(averageDaily),
      currentPrice: activeVendor?.pricePerLitre || 0,
      activeVendor,
    });
  } catch (error: any) {
    console.error('Error fetching milk summary:', error);
    return NextResponse.json({ error: error?.message || 'Failed to calculate milk summary.' }, { status: 500 });
  }
}
