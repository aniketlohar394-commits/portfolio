import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const items = await prisma.shoppingListItem.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        inventoryItem: true,
      },
      orderBy: [
        { isPurchased: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error('Failed to fetch shopping items:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, quantity, unit, estimatedPrice, priority, inventoryItemId } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const item = await prisma.shoppingListItem.create({
      data: {
        name,
        quantity: quantity ? parseFloat(quantity) : null,
        unit,
        estimatedPrice: estimatedPrice ? parseFloat(estimatedPrice) : null,
        priority: priority || 'Normal',
        inventoryItemId: inventoryItemId || null,
        userId: session.user.id,
      },
      include: {
        inventoryItem: true,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Failed to create shopping item:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
