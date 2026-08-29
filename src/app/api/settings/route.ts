import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    let settings = await prisma.userSettings.findUnique({
      where: { userId: session.user.id },
      include: { user: true }
    });

    if (!settings) {
      settings = await prisma.userSettings.create({
        data: { userId: session.user.id },
        include: { user: true }
      });
    }
    
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const data = await req.json();
    const settings = await prisma.userSettings.upsert({
      where: { userId: session.user.id },
      update: data,
      create: { ...data, userId: session.user.id }
    });
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
