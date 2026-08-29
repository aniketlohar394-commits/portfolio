import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const stockStatus = searchParams.get('stockStatus');
    const search = searchParams.get('search');

    const whereClause: any = {
      userId: session.user.id,
    };

    if (category && category !== 'all') {
      whereClause.categoryId = category;
    }

    if (search) {
      whereClause.name = {
        contains: search,
      };
    }

    const items = await prisma.inventoryItem.findMany({
      where: whereClause,
      include: {
        category: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    let filteredItems = items;
    if (stockStatus === 'low') {
      filteredItems = items.filter(
        (item) => item.currentQuantity > 0 && item.currentQuantity <= item.minimumQuantity
      );
    } else if (stockStatus === 'out') {
      filteredItems = items.filter((item) => item.currentQuantity <= 0);
    }

    return NextResponse.json(filteredItems);
  } catch (error) {
    console.error('Failed to fetch inventory:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const {
      name,
      categoryId,
      currentQuantity,
      unit,
      minimumQuantity,
      purchasePrice,
      supplier,
      expiryDate,
      notes,
    } = data;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const item = await prisma.inventoryItem.create({
      data: {
        name,
        categoryId: categoryId || null,
        currentQuantity: parseFloat(currentQuantity) || 0,
        unit: unit || 'kg',
        minimumQuantity: parseFloat(minimumQuantity) || 1,
        purchasePrice: purchasePrice ? parseFloat(purchasePrice) : null,
        supplier: supplier || null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        notes: notes || null,
        userId: session.user.id,
      },
    });

    if (purchasePrice) {
      await prisma.priceHistory.create({
        data: {
          itemId: item.id,
          price: parseFloat(purchasePrice),
          userId: session.user.id,
        },
      });
    }

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Failed to create inventory item:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
