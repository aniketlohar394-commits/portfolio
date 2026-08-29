import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = session.user.id;

  try {
    const now = new Date();

    // 1. Ensure Categories Exist
    let grocCat = await prisma.expenseCategory.findFirst({ where: { OR: [{ name: 'Groceries' }, { name: 'Grocery' }], AND: { OR: [{ userId }, { isDefault: true }] } } });
    if (!grocCat) grocCat = await prisma.expenseCategory.create({ data: { name: 'Groceries', icon: '🛒', userId } });

    let vegCat = await prisma.expenseCategory.findFirst({ where: { name: 'Vegetables', OR: [{ userId }, { isDefault: true }] } });
    if (!vegCat) vegCat = await prisma.expenseCategory.create({ data: { name: 'Vegetables', icon: '🥦', userId } });

    let milkCat = await prisma.expenseCategory.findFirst({ where: { name: 'Milk', OR: [{ userId }, { isDefault: true }] } });
    if (!milkCat) milkCat = await prisma.expenseCategory.create({ data: { name: 'Milk', icon: '🥛', userId } });

    let utilCat = await prisma.expenseCategory.findFirst({ where: { name: 'Utilities', OR: [{ userId }, { isDefault: true }] } });
    if (!utilCat) utilCat = await prisma.expenseCategory.create({ data: { name: 'Utilities', icon: '⚡', userId } });

    let transCat = await prisma.expenseCategory.findFirst({ where: { name: 'Transport', OR: [{ userId }, { isDefault: true }] } });
    if (!transCat) transCat = await prisma.expenseCategory.create({ data: { name: 'Transport', icon: '🚌', userId } });

    let medCat = await prisma.expenseCategory.findFirst({ where: { name: 'Medical', OR: [{ userId }, { isDefault: true }] } });
    if (!medCat) medCat = await prisma.expenseCategory.create({ data: { name: 'Medical', icon: '💊', userId } });

    // 2. Add Expenses
    const expenses = [
      { name: 'Milk', amount: 60, categoryId: milkCat.id, offset: 0 },
      { name: 'Vegetables', amount: 180, categoryId: vegCat.id, offset: 1 },
      { name: 'Vegetables', amount: 150, categoryId: vegCat.id, offset: 4 },
      { name: 'Vegetables', amount: 200, categoryId: vegCat.id, offset: 7 },
      { name: 'Rice 5kg', amount: 300, categoryId: grocCat.id, offset: 2 },
      { name: 'Cooking Oil 2L', amount: 250, categoryId: grocCat.id, offset: 3 },
      { name: 'Atta 5kg', amount: 280, categoryId: grocCat.id, offset: 3 },
      { name: 'Electricity Bill', amount: 1200, categoryId: utilCat.id, offset: 5 },
      { name: 'Internet Bill', amount: 599, categoryId: utilCat.id, offset: 6 },
      { name: 'Mobile Recharge', amount: 299, categoryId: utilCat.id, offset: 8 },
      { name: 'Medicine', amount: 450, categoryId: medCat.id, offset: 2 },
      { name: 'Auto/Transport', amount: 100, categoryId: transCat.id, offset: 1 },
      { name: 'Auto/Transport', amount: 150, categoryId: transCat.id, offset: 3 },
      { name: 'School Supplies', amount: 350, categoryId: grocCat.id, offset: 9 },
      { name: 'Soap/Detergent', amount: 180, categoryId: grocCat.id, offset: 4 },
    ];

    for (const e of expenses) {
      const d = new Date();
      d.setDate(d.getDate() - e.offset);
      await prisma.expense.create({
        data: {
          name: e.name,
          amount: e.amount,
          date: d,
          categoryId: e.categoryId,
          userId
        }
      });
    }

    // 3. Add Inventory
    const inventory = [
      { name: 'Rice', currentQuantity: 5, unit: 'kg', minimumQuantity: 3, purchasePrice: 60 },
      { name: 'Wheat/Atta', currentQuantity: 3, unit: 'kg', minimumQuantity: 2, purchasePrice: 35 },
      { name: 'Sugar', currentQuantity: 2, unit: 'kg', minimumQuantity: 1, purchasePrice: 45 },
      { name: 'Cooking Oil', currentQuantity: 1.5, unit: 'L', minimumQuantity: 1, purchasePrice: 180 },
      { name: 'Dal (Toor)', currentQuantity: 1, unit: 'kg', minimumQuantity: 0.5, purchasePrice: 160 },
      { name: 'Salt', currentQuantity: 1, unit: 'kg', minimumQuantity: 0.5, purchasePrice: 25 },
      { name: 'Tea', currentQuantity: 250, unit: 'gram', minimumQuantity: 100, purchasePrice: 300 }, // per kg price
      { name: 'Potato', currentQuantity: 2, unit: 'kg', minimumQuantity: 1, purchasePrice: 30 },
      { name: 'Onion', currentQuantity: 1.5, unit: 'kg', minimumQuantity: 2, purchasePrice: 35 }, // LOW
      { name: 'Soap', currentQuantity: 2, unit: 'piece', minimumQuantity: 2, purchasePrice: 45 },
      { name: 'Detergent', currentQuantity: 0.5, unit: 'kg', minimumQuantity: 1, purchasePrice: 120 }, // LOW
    ];

    for (const i of inventory) {
      await prisma.inventoryItem.create({
        data: {
          name: i.name,
          currentQuantity: i.currentQuantity,
          unit: i.unit,
          minimumQuantity: i.minimumQuantity,
          purchasePrice: i.purchasePrice,
          userId
        }
      });
    }

    // 4. Shopping List
    const shopList = [
      { name: 'Rice', quantity: 5, unit: 'kg', estimatedPrice: 300 },
      { name: 'Detergent', quantity: 1, unit: 'kg', estimatedPrice: 120 },
      { name: 'Onion', quantity: 3, unit: 'kg', estimatedPrice: 105 },
    ];
    for (const s of shopList) {
      await prisma.shoppingListItem.create({
        data: {
          name: s.name,
          quantity: s.quantity,
          unit: s.unit,
          estimatedPrice: s.estimatedPrice,
          userId
        }
      });
    }

    // 5. Milk Vendor & Deliveries
    const vendor = await prisma.milkVendor.create({
      data: {
        name: 'Local Dairy',
        pricePerLitre: 60,
        defaultQuantity: 1,
        userId
      }
    });

    for (let i = 0; i < 10; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      await prisma.milkDelivery.create({
        data: {
          vendorId: vendor.id,
          date: d,
          quantity: 1,
          pricePerLitre: 60,
          totalAmount: 60,
          userId
        }
      });
    }

    // 6. Budget
    const month = now.getMonth();
    const year = now.getFullYear();
    
    const budget = await prisma.budget.upsert({
      where: { userId_month_year: { userId, month, year } },
      update: { totalBudget: 20000 },
      create: { totalBudget: 20000, month, year, userId }
    });

    await prisma.categoryBudget.deleteMany({ where: { budgetId: budget.id } });

    await prisma.categoryBudget.createMany({
      data: [
        { budgetId: budget.id, categoryId: grocCat.id, amount: 6000 },
        { budgetId: budget.id, categoryId: vegCat.id, amount: 2000 },
        { budgetId: budget.id, categoryId: milkCat.id, amount: 2000 },
        { budgetId: budget.id, categoryId: utilCat.id, amount: 5000 },
      ]
    });

    return NextResponse.json({ success: true, message: 'Sample data loaded' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to load sample data' }, { status: 500 });
  }
}
