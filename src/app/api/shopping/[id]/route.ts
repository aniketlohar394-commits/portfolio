import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const data = await request.json();

    const existingItem = await prisma.shoppingListItem.findUnique({
      where: { id, userId: session.user.id },
    });

    if (!existingItem) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const item = await prisma.shoppingListItem.update({
      where: { id },
      data: {
        name: data.name,
        quantity: data.quantity !== undefined ? (data.quantity ? parseFloat(data.quantity) : null) : undefined,
        unit: data.unit,
        estimatedPrice: data.estimatedPrice !== undefined ? (data.estimatedPrice ? parseFloat(data.estimatedPrice) : null) : undefined,
        priority: data.priority,
        isPurchased: data.isPurchased,
        actualPrice: data.actualPrice !== undefined ? (data.actualPrice ? parseFloat(data.actualPrice) : null) : undefined,
      },
      include: {
        inventoryItem: true,
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error('Failed to update shopping item:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const existingItem = await prisma.shoppingListItem.findUnique({
      where: { id, userId: session.user.id },
    });

    if (!existingItem) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await prisma.shoppingListItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete shopping item:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
