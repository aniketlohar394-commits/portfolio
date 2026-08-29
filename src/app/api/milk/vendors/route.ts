import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const vendors = await prisma.milkVendor.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(vendors);
  } catch (error) {
    console.error('Error fetching vendors:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, pricePerLitre, defaultQuantity, frequency } = body;

    const vendor = await prisma.milkVendor.create({
      data: {
        name,
        pricePerLitre: Number(pricePerLitre),
        defaultQuantity: Number(defaultQuantity),
        frequency: frequency || 'daily',
        userId: session.user.id,
        isActive: true,
      },
    });

    return NextResponse.json(vendor);
  } catch (error) {
    console.error('Error creating vendor:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, name, pricePerLitre, defaultQuantity, frequency, isActive } = body;

    const existingVendor = await prisma.milkVendor.findUnique({
      where: { id, userId: session.user.id },
    });

    if (!existingVendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    const updatedVendor = await prisma.$transaction(async (tx) => {
      const vendor = await tx.milkVendor.update({
        where: { id },
        data: {
          name,
          pricePerLitre: Number(pricePerLitre),
          defaultQuantity: Number(defaultQuantity),
          frequency,
          isActive,
        },
      });

      if (Number(pricePerLitre) !== existingVendor.pricePerLitre) {
        await tx.milkPriceChange.create({
          data: {
            vendorId: vendor.id,
            newPrice: Number(pricePerLitre),
            effectiveDate: new Date(),
            userId: session.user.id,
          },
        });
      }

      return vendor;
    });

    return NextResponse.json(updatedVendor);
  } catch (error) {
    console.error('Error updating vendor:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
