import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

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
    const { actualPrice, actualQuantity } = await request.json();

    if (actualPrice === undefined || actualPrice === null) {
      return NextResponse.json({ error: 'Actual price is required' }, { status: 400 });
    }

    const price = parseFloat(actualPrice);
    
    const shoppingItem = await prisma.shoppingListItem.findUnique({
      where: { id, userId: session.user.id },
      include: { inventoryItem: true },
    });

    if (!shoppingItem) {
      return NextResponse.json({ error: 'Shopping item not found' }, { status: 404 });
    }

    if (shoppingItem.isPurchased) {
      return NextResponse.json({ error: 'Already purchased' }, { status: 400 });
    }

    const qty = actualQuantity !== undefined ? parseFloat(actualQuantity) : (shoppingItem.quantity || 1);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update shopping item
      const updatedShoppingItem = await tx.shoppingListItem.update({
        where: { id },
        data: {
          isPurchased: true,
          purchasedAt: new Date(),
          actualPrice: price,
          quantity: qty,
        },
      });

      // 2. Create an Expense
      await tx.expense.create({
        data: {
          amount: price,
          name: `Bought ${shoppingItem.name}`,
          userId: session.user.id,
          date: new Date(),
          notes: 'Auto-generated from shopping list',
          categoryId: shoppingItem.inventoryItem?.categoryId || null, // Optional mapping
        },
      });

      // 3. Update Inventory if linked
      if (shoppingItem.inventoryItemId) {
        const invItem = shoppingItem.inventoryItem!;
        
        // Price per unit for inventory updates
        const pricePerUnit = price / qty;

        const updatedInvItem = await tx.inventoryItem.update({
          where: { id: invItem.id },
          data: {
            currentQuantity: invItem.currentQuantity + qty,
            purchasePrice: pricePerUnit,
            lastPurchaseDate: new Date(),
          },
        });

        // Create Inventory Transaction
        await tx.inventoryTransaction.create({
          data: {
            itemId: invItem.id,
            type: 'purchase',
            quantity: qty,
            pricePerUnit: pricePerUnit,
            notes: 'Purchased from shopping list',
            userId: session.user.id,
          },
        });

        // Create Price History if price changed
        if (invItem.purchasePrice !== pricePerUnit) {
          await tx.priceHistory.create({
            data: {
              itemId: invItem.id,
              price: pricePerUnit,
              userId: session.user.id,
            },
          });
        }
      }

      return updatedShoppingItem;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to purchase shopping item:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
