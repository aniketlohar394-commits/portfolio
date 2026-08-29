import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name: name || email.split("@")[0],
        email,
        hashedPassword,
        settings: {
          create: {
            currency: "INR",
            currencySymbol: "₹",
            language: "en",
            theme: "light",
            monthlyBudget: 20000,
          },
        },
      },
    })

    // Create default expense categories
    const defaultCategories = [
      { name: "Milk", icon: "🥛", color: "#3498DB", isDefault: true },
      { name: "Vegetables", icon: "🥬", color: "#27AE60", isDefault: true },
      { name: "Fruits", icon: "🍎", color: "#E74C3C", isDefault: true },
      { name: "Groceries", icon: "🛒", color: "#E67E22", isDefault: true },
      { name: "Household", icon: "🏠", color: "#9B59B6", isDefault: true },
      { name: "Electricity", icon: "💡", color: "#F1C40F", isDefault: true },
      { name: "Water", icon: "💧", color: "#3498DB", isDefault: true },
      { name: "Gas", icon: "🔥", color: "#E67E22", isDefault: true },
      { name: "Internet", icon: "🌐", color: "#2ECC71", isDefault: true },
      { name: "Mobile Recharge", icon: "📱", color: "#1ABC9C", isDefault: true },
      { name: "Education", icon: "📚", color: "#8E44AD", isDefault: true },
      { name: "Healthcare", icon: "💊", color: "#E74C3C", isDefault: true },
      { name: "Transportation", icon: "🚗", color: "#34495E", isDefault: true },
      { name: "Clothing", icon: "👕", color: "#E91E63", isDefault: true },
      { name: "Personal", icon: "💄", color: "#FF6F61", isDefault: true },
      { name: "Other", icon: "📦", color: "#95A5A6", isDefault: true },
    ]

    await prisma.expenseCategory.createMany({
      data: defaultCategories.map(cat => ({
        ...cat,
        userId: user.id,
      })),
    })

    // Create default inventory categories
    const defaultInvCategories = [
      { name: "Groceries", icon: "🛒", isDefault: true },
      { name: "Vegetables", icon: "🥬", isDefault: true },
      { name: "Fruits", icon: "🍎", isDefault: true },
      { name: "Household Items", icon: "🏠", isDefault: true },
      { name: "Dairy", icon: "🥛", isDefault: true },
      { name: "Spices", icon: "🌶️", isDefault: true },
    ]

    await prisma.inventoryCategory.createMany({
      data: defaultInvCategories.map(cat => ({
        ...cat,
        userId: user.id,
      })),
    })

    return NextResponse.json(
      { message: "Account created successfully", userId: user.id },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
