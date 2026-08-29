import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const categories = await prisma.inventoryCategory.findMany({
      where: {
        OR: [
          { userId: session.user.id },
          { isDefault: true }
        ]
      }
    });
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { name, icon } = await req.json();
    const cat = await prisma.inventoryCategory.create({
      data: { name, icon: icon || '📦', userId: session.user.id }
    });
    return NextResponse.json(cat);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await req.json();
    const cat = await prisma.inventoryCategory.findUnique({ where: { id } });
    if (cat?.isDefault || cat?.userId !== session.user.id) {
      return NextResponse.json({ error: 'Cannot delete' }, { status: 403 });
    }
    await prisma.inventoryCategory.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
