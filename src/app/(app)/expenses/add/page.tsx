'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Check, Wallet, DollarSign, Calendar, Tag, ShieldAlert } from 'lucide-react'
import Toast, { ToastType } from '@/components/Toast'

export default function AddExpensePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const defaultName = searchParams.get('name') || ''
  
  const [formData, setFormData] = useState({
    amount: '',
    name: defaultName,
    categoryId: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash',
    priority: 'Normal',
    notes: '',
    isRecurring: false
  })
  
  const [categories, setCategories] = useState<any[]>([])
  const [toast, setToast] = useState<{ message: string; type: ToastType; visible: boolean }>({
    message: '',
    type: 'info',
    visible: false
  })

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type, visible: true })
  }

  useEffect(() => {
    fetchCategories()
    if (id) {
      fetch(`/api/expenses/${id}`)
        .then(res => res.json())
        .then(data => {
          if (data && !data.error) {
            setFormData({
              ...data,
              amount: data.amount ? data.amount.toString() : '',
              date: new Date(data.date).toISOString().split('T')[0]
            })
          }
        })
    }
  }, [id])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      if (res.ok) {
        const data = await res.json()
        setCategories(data || [])
        if (data.length > 0 && !formData.categoryId) {
          setFormData(prev => ({ ...prev, categoryId: data[0].id }))
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.amount) {
      showToast('Please enter expense name and amount.', 'warning')
      return
    }

    const method = id ? 'PUT' : 'POST'
    const url = id ? `/api/expenses/${id}` : '/api/expenses'
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount)
        })
      })
      if (res.ok) {
        showToast(id ? 'Expense updated successfully!' : 'Expense saved successfully!', 'success')
        setTimeout(() => {
          router.push('/expenses')
          router.refresh()
        }, 600)
      } else {
        showToast('Failed to save expense.', 'error')
      }
    } catch (error) {
      console.error(error)
      showToast('Error connecting to server.', 'error')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '48px', maxWidth: '800px', margin: '0 auto' }}>
      <Toast 
        message={toast.message} 
        type={toast.type} 
        visible={toast.visible} 
        onClose={() => setToast({ ...toast, visible: false })} 
      />

      {/* Header Banner */}
      <div className="hero-banner flex-between-center" style={{ flexWrap: 'wrap', gap: '16px' }}>
        <div className="flex-row-gap" style={{ gap: '14px' }}>
          <Link href="/expenses" className="btn btn-secondary" style={{ borderRadius: '12px', width: '40px', height: '40px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
            <ArrowLeft size={20} />
          </Link>

          <div>
            <div className="badge badge-primary" style={{ alignSelf: 'flex-start', padding: '4px 10px', fontSize: '10px', fontWeight: 'bold' }}>
              <Wallet size={12} /> Expense Tracker
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-text)', letterSpacing: '-0.5px', margin: '4px 0 0 0' }}>
              {id ? 'Edit Expense' : 'Add Household Expense'}
            </h1>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Amount Input Hero Card */}
        <div className="glass-card" style={{ padding: '28px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Expense Amount (₹)</span>
          <div className="flex-row-gap" style={{ justifyContent: 'center', gap: '8px', width: '100%' }}>
            <span style={{ fontSize: '36px', fontWeight: '800', color: 'var(--color-primary)' }}>₹</span>
            <input 
              type="number" 
              step="any"
              required
              value={formData.amount}
              onChange={e => setFormData({...formData, amount: e.target.value})}
              placeholder="0.00"
              style={{ fontSize: '42px', fontWeight: '800', color: 'var(--color-text)', border: 'none', background: 'transparent', textAlign: 'left', outline: 'none', maxWidth: '240px' }}
            />
          </div>
        </div>

        {/* Expense Details Container */}
        <div className="glass-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label className="form-label">What was this expense for? *</label>
            <input 
              type="text" 
              required
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="e.g., Milk, Vegetables, Electricity Bill"
              className="form-input"
              style={{ fontSize: '15px', fontWeight: '700' }}
            />
          </div>

          {/* Category Grid */}
          <div>
            <label className="form-label">Select Category</label>
            <div className="grid-4-cols" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
              {categories.map(cat => {
                const isSelected = formData.categoryId === cat.id;

                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setFormData({...formData, categoryId: cat.id})}
                    className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                    style={{
                      borderRadius: '16px',
                      padding: '12px 8px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px',
                      fontWeight: '700'
                    }}
                  >
                    <span style={{ fontSize: '20px' }}>{cat.icon || '📦'}</span>
                    <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', width: '100%', textAlign: 'center' }}>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid-2-cols">
            <div>
              <label className="form-label">Date</label>
              <input 
                type="date"
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Payment Method</label>
              <select 
                value={formData.paymentMethod}
                onChange={e => setFormData({...formData, paymentMethod: e.target.value})}
                className="form-select"
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Card">Card</option>
                <option value="Net Banking">Net Banking</option>
              </select>
            </div>
          </div>

          <div>
            <label className="form-label">Priority Level</label>
            <div className="grid-3-layout" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {[
                { name: 'Normal', color: '#64748B', label: '⚪ Normal' },
                { name: 'Important', color: '#F59E0B', label: '🟠 Important' },
                { name: 'High', color: '#EF4444', label: '🔴 High' }
              ].map(p => (
                <button
                  type="button"
                  key={p.name}
                  onClick={() => setFormData({...formData, priority: p.name})}
                  className={`btn ${formData.priority === p.name ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ borderRadius: '12px', fontSize: '13px', fontWeight: '700', padding: '10px' }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="form-label">Notes & Details (Optional)</label>
            <textarea 
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
              className="form-input"
              rows={3}
              placeholder="Add any extra notes, receipt details, or memory tags..."
              style={{ borderRadius: '14px' }}
            ></textarea>
          </div>

          <div className="flex-between-center" style={{ padding: '14px 18px', borderRadius: '14px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', width: '100%' }}>
              <input 
                type="checkbox" 
                checked={formData.isRecurring}
                onChange={e => setFormData({...formData, isRecurring: e.target.checked})}
                style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
              />
              <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-text)' }}>Mark as Recurring Monthly Expense</span>
            </label>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary hover-lift"
            style={{ width: '100%', borderRadius: '14px', fontSize: '15px', fontWeight: '800', padding: '14px', marginTop: '12px' }}
          >
            Save Household Expense
          </button>
        </div>
      </form>
    </div>
  )
}
