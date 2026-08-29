'use client'

import { useState, useEffect } from 'react'
import { formatCurrency } from '@/lib/utils'
import { Plus, Trash2 } from 'lucide-react'

export default function RecurringExpensesPage() {
  const [expenses, setExpenses] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    frequency: 'monthly',
    icon: '🧾',
    isActive: true
  })

  useEffect(() => {
    fetchExpenses()
  }, [])

  const fetchExpenses = async () => {
    const res = await fetch('/api/recurring-expenses')
    if (res.ok) {
      setExpenses(await res.json())
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await fetch('/api/recurring-expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          amount: parseFloat(formData.amount),
          frequency: formData.frequency,
          icon: formData.icon,
          isActive: formData.isActive
        })
      })
      setShowModal(false)
      fetchExpenses()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Recurring</h1>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1 text-[var(--color-primary)] font-medium text-sm bg-orange-50 px-3 py-1.5 rounded-full"
        >
          <Plus size={16} /> Add New
        </button>
      </div>

      <div className="space-y-3">
        {expenses.map((exp: any) => (
          <div key={exp.id} className="bg-white p-4 rounded-xl shadow-sm border border-[var(--color-border)] flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="text-3xl bg-gray-50 p-2 rounded-xl">{exp.icon || '🧾'}</div>
              <div>
                <p className="font-bold text-[var(--color-text)]">{exp.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 capitalize">{exp.frequency}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${exp.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {exp.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right flex flex-col items-end">
              <p className="font-bold text-lg text-[var(--color-text)] mb-2">{formatCurrency(exp.amount)}</p>
              <button className="text-red-500 p-1.5 bg-red-50 rounded-lg"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4">Add Recurring Expense</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3 border rounded-xl" placeholder="e.g. Netflix, Rent" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Amount (₹)</label>
                <input required type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full p-3 border rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Frequency</label>
                  <select value={formData.frequency} onChange={e => setFormData({...formData, frequency: e.target.value})} className="w-full p-3 border rounded-xl">
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Icon (Emoji)</label>
                  <input value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} className="w-full p-3 border rounded-xl text-center text-xl" />
                </div>
              </div>
              <label className="flex items-center gap-2 mt-4">
                <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-5 h-5" />
                <span>Active</span>
              </label>
              
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 border rounded-xl font-medium">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-[var(--color-primary)] text-white rounded-xl font-bold">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
