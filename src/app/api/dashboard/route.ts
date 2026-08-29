import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const userId = session.user.id

    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    // Today's total spending and expense count
    const todayExpenses = await prisma.expense.findMany({
      where: {
        userId,
        date: { gte: todayStart }
      }
    })
    const todayTotal = todayExpenses.reduce((sum: number, exp: any) => sum + exp.amount, 0)
    const expenseCount = todayExpenses.length

    // This month's total spending
    const monthExpenses = await prisma.expense.aggregate({
      where: {
        userId,
        date: { gte: monthStart }
      },
      _sum: {
        amount: true
      }
    })
    const monthTotal = monthExpenses._sum.amount || 0

    // Monthly budget
    let userSettings
    try {
      userSettings = await prisma.userSettings.findUnique({ where: { userId } })
    } catch(e) {
      // In case UserSettings is not defined
    }
    const monthlyBudget = userSettings?.monthlyBudget || 20000 // default fallback

    // Recent expenses (last 10)
    const recentExpenses = await prisma.expense.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 10,
      include: { category: true }
    })

    // Low stock inventory items
    let filteredLowStock: any[] = []
    try {
      const allItems = await prisma.inventoryItem.findMany({ where: { userId } })
      filteredLowStock = allItems.filter((i: any) => i.currentQuantity <= i.minimumQuantity)
    } catch (e) {}

    // Priority expenses
    const priorityExpenses = await prisma.expense.findMany({
      where: {
        userId,
        priority: { in: ['Important', 'High'] }
      },
      orderBy: { date: 'desc' }
    })

    // Quick add items (from recurring expenses)
    let quickAddItems: any[] = []
    try {
      quickAddItems = await prisma.recurringExpense.findMany({
        where: { userId, isActive: true }
      })
    } catch(e) {}

    return NextResponse.json({
      todayTotal,
      expenseCount,
      monthTotal,
      monthlyBudget,
      recentExpenses,
      lowStockItems: filteredLowStock,
      priorityExpenses,
      quickAddItems
    })
  } catch (error) {
    console.error('Dashboard API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
