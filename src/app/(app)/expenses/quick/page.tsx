'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'

const QUICK_ITEMS = [
  { name: 'Milk', amount: 60, icon: '🥛', category: 'Groceries' },
  { name: 'Vegetables', amount: 100, icon: '🥬', category: 'Groceries' },
  { name: 'Fruits', amount: 80, icon: '🍎', category: 'Groceries' },
  { name: 'Groceries', amount: 200, icon: '🛒', category: 'Groceries' },
  { name: 'Gas', amount: 1000, icon: '⛽', category: 'Bills' },
  { name: 'Electricity', amount: 1200, icon: '💡', category: 'Bills' },
  { name: 'Mobile', amount: 299, icon: '📱', category: 'Bills' },
  { name: 'Transport', amount: 100, icon: '🚗', category: 'Transport' },
]

export default function QuickAddPage() {
  const router = useRouter()
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [amount, setAmount] = useState('')
  const [toast, setToast] = useState('')

  const handleSelect = (item: any) => {
    setSelectedItem(item)
    setAmount(item.amount.toString())
  }

  const handleSave = async () => {
    if (!selectedItem) return
    try {
      await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: selectedItem.name,
          amount: parseFloat(amount),
          date: new Date().toISOString(),
          paymentMethod: 'Cash',
          priority: 'Normal'
        })
      })
      setToast(`✓ Expense Added - ${selectedItem.name} ₹${amount}`)
      setSelectedItem(null)
      setTimeout(() => setToast(''), 3000)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="p-4 max-w-2xl mx-auto min-h-screen relative">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Quick Add</h1>
        <button onClick={() => router.push('/dashboard')} className="text-[var(--color-primary)] font-medium text-sm">
          Back to Dashboard
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {QUICK_ITEMS.map((item, idx) => (
          <button 
            key={idx}
            onClick={() => handleSelect(item)}
            className="bg-white p-6 rounded-2xl shadow-sm border border-[var(--color-border)] flex flex-col items-center justify-center gap-2 active:bg-gray-50 active:scale-95 transition-all"
          >
            <span className="text-4xl">{item.icon}</span>
            <span className="font-semibold text-[var(--color-text)]">{item.name}</span>
            <span className="text-sm font-medium text-[var(--color-text-secondary)]">₹{item.amount}</span>
          </button>
        ))}
      </div>

      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 space-y-6">
            <div className="text-center">
              <span className="text-5xl mb-2 block">{selectedItem.icon}</span>
              <h2 className="text-xl font-bold">Add {selectedItem.name}</h2>
            </div>
            
            <div>
              <label className="text-sm text-gray-500 font-medium text-center block mb-2">Amount (₹)</label>
              <input 
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full text-center text-4xl font-bold border-b-2 border-gray-300 focus:border-[var(--color-primary)] focus:outline-none pb-2"
              />
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setSelectedItem(null)}
                className="flex-1 py-3 rounded-xl font-medium border border-gray-300 text-gray-600"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="flex-1 py-3 rounded-xl font-bold bg-[var(--color-primary)] text-white shadow-md"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full flex items-center shadow-xl z-50">
          <span className="font-medium text-sm">{toast}</span>
        </div>
      )}
    </div>
  )
}
