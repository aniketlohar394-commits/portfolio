import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getDaysInMonth } from '@/lib/utils';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    const { searchParams } = new URL(req.url);
    const month = parseInt(searchParams.get('month') || new Date().getMonth().toString());
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
    const compareMonthStr = searchParams.get('compareMonth');
    const compareYearStr = searchParams.get('compareYear');

    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);
    const daysInMonth = getDaysInMonth(year, month);

    // Fetch expenses
    const expenses = await prisma.expense.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate }
      },
      include: { category: true }
    });

    let totalExpenses = 0;
    const dailySpendingMap: Record<number, number> = {};
    const categoryMap: Record<string, { amount: number; name: string; color: string; icon: string }> = {};
    let highestDay = { date: 1, amount: 0 };

    for (let i = 1; i <= daysInMonth; i++) {
      dailySpendingMap[i] = 0;
    }

    expenses.forEach(exp => {
      totalExpenses += exp.amount;
      
      const day = new Date(exp.date).getDate();
      dailySpendingMap[day] += exp.amount;
      
      if (dailySpendingMap[day] > highestDay.amount) {
        highestDay = { date: day, amount: dailySpendingMap[day] };
      }

      const catId = exp.categoryId || 'uncategorized';
      if (!categoryMap[catId]) {
        categoryMap[catId] = {
          amount: 0,
          name: exp.category?.name || 'Uncategorized',
          color: exp.category?.color || '#95A5A6',
          icon: exp.category?.icon || '📦'
        };
      }
      categoryMap[catId].amount += exp.amount;
    });

    const categoryBreakdown = Object.values(categoryMap).map(cat => ({
      ...cat,
      percentage: totalExpenses > 0 ? (cat.amount / totalExpenses) * 100 : 0
    })).sort((a, b) => b.amount - a.amount);

    const dailySpendingData = Object.entries(dailySpendingMap).map(([day, amount]) => ({
      date: parseInt(day),
      amount
    }));

    // User budget
    const userSettings = await prisma.userSettings.findUnique({ where: { userId } });
    const budget = userSettings?.monthlyBudget || 20000;

    // Milk report data
    const milkDeliveries = await prisma.milkDelivery.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate }
      }
    });

    let milkTotalQuantity = 0;
    let milkTotalSpent = 0;
    let milkDaysDelivered = 0;
    let milkDaysMissed = 0;
    
    milkDeliveries.forEach(d => {
      if (d.status === 'delivered') {
        milkTotalQuantity += d.quantity;
        milkTotalSpent += d.totalAmount;
        milkDaysDelivered++;
      } else if (d.status === 'not_delivered' || d.status === 'skipped') {
        milkDaysMissed++;
      }
    });

    const activeVendor = await prisma.milkVendor.findFirst({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    // Comparison data
    let comparisonData = null;
    if (compareMonthStr !== null && compareYearStr !== null) {
      const cMonth = parseInt(compareMonthStr);
      const cYear = parseInt(compareYearStr);
      const cStartDate = new Date(cYear, cMonth, 1);
      const cEndDate = new Date(cYear, cMonth + 1, 0, 23, 59, 59, 999);

      const compExpenses = await prisma.expense.aggregate({
        where: { userId, date: { gte: cStartDate, lte: cEndDate } },
        _sum: { amount: true }
      });
      comparisonData = {
        month: cMonth,
        year: cYear,
        totalExpenses: compExpenses._sum.amount || 0
      };
    }

    return NextResponse.json({
      totalExpenses,
      budget,
      averageDailyExpense: totalExpenses / daysInMonth,
      highestSpendingDay: highestDay,
      categoryBreakdown,
      dailySpendingData,
      comparisonData,
      milkReport: {
        totalQuantity: milkTotalQuantity,
        totalSpent: milkTotalSpent,
        daysDelivered: milkDaysDelivered,
        daysMissed: milkDaysMissed,
        currentPrice: activeVendor?.pricePerLitre || 0
      }
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
