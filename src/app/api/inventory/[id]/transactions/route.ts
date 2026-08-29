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

    const transactions = await prisma.inventoryTransaction.findMany({
      where: {
        itemId: id,
        userId: session.user.id,
      },
      orderBy: {
        date: 'desc',
      },
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Failed to fetch transactions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { type, quantity, pricePerUnit, notes } = await request.json();

    if (!['purchase', 'consume', 'adjust'].includes(type)) {
      return NextResponse.json({ error: 'Invalid transaction type' }, { status: 400 });
    }

    const item = await prisma.inventoryItem.findUnique({
      where: { id, userId: session.user.id },
    });

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    let newQuantity = item.currentQuantity;
    const qty = parseFloat(quantity);

    if (type === 'purchase') {
      newQuantity += qty;
    } else if (type === 'consume') {
      newQuantity = Math.max(0, newQuantity - qty);
    } else if (type === 'adjust') {
      newQuantity = qty;
    }

    const updateData: any = {
      currentQuantity: newQuantity,
    };

    if (type === 'purchase') {
      updateData.lastPurchaseDate = new Date();
      if (pricePerUnit !== undefined && pricePerUnit !== null) {
        updateData.purchasePrice = parseFloat(pricePerUnit);
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedItem = await tx.inventoryItem.update({
        where: { id },
        data: updateData,
      });

      const transaction = await tx.inventoryTransaction.create({
        data: {
          itemId: id,
          type,
          quantity: qty,
          pricePerUnit: pricePerUnit ? parseFloat(pricePerUnit) : null,
          notes,
          userId: session.user.id,
        },
      });

      if (type === 'purchase' && pricePerUnit !== undefined && pricePerUnit !== null && pricePerUnit !== item.purchasePrice) {
        await tx.priceHistory.create({
          data: {
            itemId: id,
            price: parseFloat(pricePerUnit),
            userId: session.user.id,
          },
        });
      }

      return { item: updatedItem, transaction };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Failed to create transaction:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
