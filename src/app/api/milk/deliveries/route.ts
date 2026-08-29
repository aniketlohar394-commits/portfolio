import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const month = parseInt(searchParams.get('month') || new Date().getMonth().toString());
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());

    // UTC range to prevent local server timezone offset issues
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

    return NextResponse.json(deliveries);
  } catch (error: any) {
    console.error('Error fetching deliveries:', error);
    return NextResponse.json({ error: error?.message || 'Failed to fetch milk deliveries.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await req.json();
    const { vendorId, date, status, quantity, pricePerLitre } = body;

    if (!vendorId) {
      return NextResponse.json({ error: 'Vendor ID is required. Please select or add an active vendor in Milk Settings.' }, { status: 400 });
    }

    if (!date) {
      return NextResponse.json({ error: 'Delivery date is required.' }, { status: 400 });
    }

    // Check if vendor exists
    const vendor = await prisma.milkVendor.findFirst({
      where: { id: vendorId, userId }
    });

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found. Please configure vendor in Milk Settings.' }, { status: 404 });
    }

    const deliveryDate = new Date(date);
    if (isNaN(deliveryDate.getTime())) {
      return NextResponse.json({ error: 'Invalid delivery date format.' }, { status: 400 });
    }

    // Normalize date to start of day in UTC
    const normalizedDate = new Date(Date.UTC(deliveryDate.getUTCFullYear(), deliveryDate.getUTCMonth(), deliveryDate.getUTCDate()));

    let totalAmount = 0;
    if (status === 'delivered') {
      totalAmount = Number(quantity) * Number(pricePerLitre);
    }

    // Find or create 'Milk' category
    let milkCategory = await prisma.expenseCategory.findFirst({
      where: { userId, name: { equals: 'Milk' } },
    });
    
    if (!milkCategory && status === 'delivered') {
      milkCategory = await prisma.expenseCategory.create({
        data: { name: 'Milk', icon: '🥛', color: '#3498DB', userId, isDefault: true }
      });
    }

    const delivery = await prisma.$transaction(async (tx) => {
      const existingDelivery = await tx.milkDelivery.findUnique({
        where: {
          vendorId_date: {
            vendorId,
            date: normalizedDate,
          }
        }
      });

      let updatedDelivery;
      
      if (existingDelivery) {
        updatedDelivery = await tx.milkDelivery.update({
          where: { id: existingDelivery.id },
          data: { status, quantity: Number(quantity), pricePerLitre: Number(pricePerLitre), totalAmount }
        });
      } else {
        updatedDelivery = await tx.milkDelivery.create({
          data: {
            vendorId,
            date: normalizedDate,
            status,
            quantity: Number(quantity),
            pricePerLitre: Number(pricePerLitre),
            totalAmount,
            userId,
          }
        });
      }

      if (status === 'delivered') {
        const existingExpense = await tx.expense.findUnique({
          where: { milkDeliveryId: updatedDelivery.id }
        });

        if (existingExpense) {
          await tx.expense.update({
            where: { id: existingExpense.id },
            data: { amount: totalAmount, date: normalizedDate, categoryId: milkCategory?.id }
          });
        } else {
          await tx.expense.create({
            data: {
              amount: totalAmount,
              name: 'Milk Delivery',
              date: normalizedDate,
              categoryId: milkCategory?.id,
              milkDeliveryId: updatedDelivery.id,
              userId
            }
          });
        }
      } else {
        const existingExpense = await tx.expense.findUnique({
          where: { milkDeliveryId: updatedDelivery.id }
        });
        if (existingExpense) {
          await tx.expense.delete({
            where: { id: existingExpense.id }
          });
        }
      }

      return updatedDelivery;
    });

    return NextResponse.json(delivery);
  } catch (error: any) {
    console.error('Error recording delivery:', error);
    return NextResponse.json({ error: error?.message || 'Failed to save milk delivery record.' }, { status: 500 });
  }
}
