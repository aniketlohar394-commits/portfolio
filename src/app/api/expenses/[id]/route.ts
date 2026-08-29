import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const expense = await prisma.expense.findFirst({
      where: { id, userId: session.user.id },
      include: { category: true }
    })

    if (!expense) return NextResponse.json({ error: 'Not Found' }, { status: 404 })

    return NextResponse.json(expense)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await request.json()
    const updated = await prisma.expense.updateMany({
      where: { id, userId: session.user.id },
      data: body
    })

    if (updated.count === 0) return NextResponse.json({ error: 'Not Found' }, { status: 404 })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const deleted = await prisma.expense.deleteMany({
      where: { id, userId: session.user.id }
    })

    if (deleted.count === 0) return NextResponse.json({ error: 'Not Found' }, { status: 404 })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
