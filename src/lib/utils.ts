// Date formatting utilities
export function formatDate(date: Date | string, format: string = 'DD/MM/YYYY'): string {
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  
  switch (format) {
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`
    case 'DD MMM':
      return `${day} ${getMonthShort(d.getMonth())}`
    case 'DD MMM YYYY':
      return `${day} ${getMonthShort(d.getMonth())} ${year}`
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`
    default:
      return `${day}/${month}/${year}`
  }
}

export function formatCurrency(amount: number, symbol: string = '₹'): string {
  return `${symbol}${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

export function formatQuantity(quantity: number, unit: string): string {
  return `${quantity} ${unit}`
}

function getMonthShort(monthIndex: number): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return months[monthIndex]
}

export function getMonthName(monthIndex: number): string {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  return months[monthIndex]
}

// Date helpers
export function isToday(date: Date | string): boolean {
  const d = new Date(date)
  const today = new Date()
  return d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
}

export function isThisWeek(date: Date | string): boolean {
  const d = new Date(date)
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 7)
  return d >= startOfWeek && d < endOfWeek
}

export function isThisMonth(date: Date | string): boolean {
  const d = new Date(date)
  const now = new Date()
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
}

export function getStartOfMonth(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function getEndOfMonth(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
}

export function getStartOfDay(date: Date = new Date()): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function getEndOfDay(date: Date = new Date()): Date {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 17) return 'Good Afternoon'
  return 'Good Evening'
}

// Budget status helpers
export function getBudgetStatus(spent: number, budget: number): 'normal' | 'warning' | 'high' | 'exceeded' {
  if (budget <= 0) return 'normal'
  const percentage = (spent / budget) * 100
  if (percentage >= 100) return 'exceeded'
  if (percentage >= 80) return 'high'
  if (percentage >= 50) return 'warning'
  return 'normal'
}

export function getBudgetStatusColor(status: string): string {
  switch (status) {
    case 'exceeded': return 'var(--color-danger)'
    case 'high': return 'var(--color-danger)'
    case 'warning': return 'var(--color-warning)'
    default: return 'var(--color-secondary)'
  }
}

// Stock status helpers
export function getStockStatus(current: number, minimum: number): 'in_stock' | 'low_stock' | 'out_of_stock' {
  if (current <= 0) return 'out_of_stock'
  if (current <= minimum) return 'low_stock'
  return 'in_stock'
}

export function getStockStatusLabel(status: string): string {
  switch (status) {
    case 'out_of_stock': return 'Out of Stock'
    case 'low_stock': return 'Low Stock'
    default: return 'In Stock'
  }
}

export function getStockStatusClass(status: string): string {
  switch (status) {
    case 'out_of_stock': return 'stock-out'
    case 'low_stock': return 'stock-low'
    default: return 'stock-in'
  }
}

// Priority helpers
export function getPriorityLabel(priority: string): string {
  switch (priority) {
    case 'High': return '🔴 High Priority'
    case 'Important': return '🟠 Important'
    default: return '🟢 Normal'
  }
}

export function getPriorityDotClass(priority: string): string {
  switch (priority) {
    case 'High': return 'priority-high'
    case 'Important': return 'priority-important'
    default: return 'priority-normal'
  }
}

// Category icons
export const EXPENSE_CATEGORY_ICONS: Record<string, string> = {
  'Milk': '🥛',
  'Vegetables': '🥬',
  'Fruits': '🍎',
  'Groceries': '🛒',
  'Household': '🏠',
  'Electricity': '💡',
  'Water': '💧',
  'Gas': '🔥',
  'Internet': '🌐',
  'Mobile Recharge': '📱',
  'Education': '📚',
  'Healthcare': '💊',
  'Transportation': '🚗',
  'Clothing': '👕',
  'Personal': '💄',
  'Other': '📦',
}

export const PAYMENT_METHODS = [
  'Cash',
  'UPI',
  'Debit Card',
  'Credit Card',
  'Bank Transfer',
  'Other',
]

export const UNITS = [
  'kg',
  'gram',
  'litre',
  'ml',
  'piece',
  'packet',
  'box',
  'bottle',
  'dozen',
]

export const FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
]
