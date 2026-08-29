import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const item = await prisma.inventoryItem.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        category: true,
        transactions: {
          orderBy: { date: 'desc' },
        },
        priceHistory: {
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!item) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error('Failed to fetch item:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

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

    const existingItem = await prisma.inventoryItem.findUnique({
      where: { id, userId: session.user.id },
    });

    if (!existingItem) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const item = await prisma.inventoryItem.update({
      where: { id },
      data: {
        name: data.name,
        categoryId: data.categoryId || null,
        currentQuantity: data.currentQuantity !== undefined ? parseFloat(data.currentQuantity) : undefined,
        unit: data.unit,
        minimumQuantity: data.minimumQuantity !== undefined ? parseFloat(data.minimumQuantity) : undefined,
        purchasePrice: data.purchasePrice !== undefined ? (data.purchasePrice ? parseFloat(data.purchasePrice) : null) : undefined,
        supplier: data.supplier,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        notes: data.notes,
      },
    });

    if (data.purchasePrice !== undefined && data.purchasePrice !== existingItem.purchasePrice) {
      if (data.purchasePrice) {
        await prisma.priceHistory.create({
          data: {
            itemId: item.id,
            price: parseFloat(data.purchasePrice),
            userId: session.user.id,
          },
        });
      }
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error('Failed to update item:', error);
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

    const existingItem = await prisma.inventoryItem.findUnique({
      where: { id, userId: session.user.id },
    });

    if (!existingItem) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await prisma.inventoryItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete item:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
