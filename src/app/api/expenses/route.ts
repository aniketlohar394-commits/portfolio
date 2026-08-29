import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('category')
    const search = searchParams.get('search')
    const payment = searchParams.get('payment')
    const priority = searchParams.get('priority')
    
    let whereClause: any = { userId: session.user.id }
    
    if (categoryId) whereClause.categoryId = categoryId
    if (search) whereClause.name = { contains: search }
    if (payment) whereClause.paymentMethod = payment
    if (priority) whereClause.priority = priority

    const expenses = await prisma.expense.findMany({
      where: whereClause,
      orderBy: { date: 'desc' },
      include: { category: true }
    })

    return NextResponse.json({ expenses, total: expenses.length })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { amount, name, categoryId, date, paymentMethod, notes, priority, isRecurring } = body

    if (amount === undefined || amount === null || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const expense = await prisma.expense.create({
      data: {
        userId: session.user.id,
        amount: parseFloat(amount),
        name,
        categoryId,
        date: date ? new Date(date) : new Date(),
        paymentMethod: paymentMethod || 'Cash',
        notes: notes || '',
        priority: priority || 'Normal',
        isRecurring: isRecurring || false
      }
    })

    return NextResponse.json(expense)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
