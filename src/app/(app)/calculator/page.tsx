'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Calculator, Sparkles, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import Toast, { ToastType } from '@/components/Toast';

export default function CalculatorPage() {
  const [items, setItems] = useState([{ name: '', amount: 0, quantity: 1, price: 0 }]);
  const [showModal, setShowModal] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [expenseName, setExpenseName] = useState('Calculated Household Bill');
  const [mode, setMode] = useState<'multi'|'single'>('multi');
  const [toast, setToast] = useState<{ message: string; type: ToastType; visible: boolean }>({
    message: '',
    type: 'info',
    visible: false
  });

  const [singleQty, setSingleQty] = useState(1);
  const [singlePrice, setSinglePrice] = useState(0);

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type, visible: true });
  };

  const total = mode === 'multi' 
    ? items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
    : (singleQty * singlePrice);

  const handleSaveExpense = async () => {
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: expenseName,
          amount: total,
          categoryId: selectedCategory || undefined,
          date: new Date().toISOString(),
          paymentMethod: 'Cash',
          priority: 'Normal',
          isRecurring: false
        })
      });
      if (res.ok) {
        setShowModal(false);
        showToast(`Saved expense "${expenseName}" for ₹${total}!`, 'success');
      }
    } catch (e) {
      showToast('Error saving expense.', 'error');
    }
  };

  const openModal = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
        if (data.length > 0) setSelectedCategory(data[0].id);
      }
    } catch (e) {
      console.error(e);
    }
    setShowModal(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '48px', maxWidth: '1150px', margin: '0 auto' }}>
      <Toast 
        message={toast.message} 
        type={toast.type} 
        visible={toast.visible} 
        onClose={() => setToast({ ...toast, visible: false })} 
      />

      {/* Header Banner */}
      <div className="hero-banner flex-between-center" style={{ flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div className="badge badge-primary" style={{ alignSelf: 'flex-start', padding: '6px 12px', fontSize: '11px', fontWeight: 'bold' }}>
            <Calculator size={13} /> Quick Splitter
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--color-text)', letterSpacing: '-0.5px', margin: 0 }}>
            Split & Quick Calculator
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: 0 }}>
            Instantly tally multi-item receipts or unit price totals, and log directly into expenses.
          </p>
        </div>

        {/* Mode Toggle Buttons */}
        <div className="flex-row-gap" style={{ gap: '8px' }}>
          <button 
            onClick={() => setMode('multi')} 
            className={`btn btn-sm ${mode === 'multi' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '14px', fontSize: '13px', fontWeight: '700', padding: '10px 18px' }}
          >
            Multi-Item Bill
          </button>
          <button 
            onClick={() => setMode('single')} 
            className={`btn btn-sm ${mode === 'single' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '14px', fontSize: '13px', fontWeight: '700', padding: '10px 18px' }}
          >
            Unit Price Tally
          </button>
        </div>
      </div>

      {/* Calculator Body Box */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {mode === 'single' ? (
          <div className="grid-2-cols">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label className="form-label">Quantity</label>
              <input 
                type="number" 
                value={singleQty} 
                onChange={e => setSingleQty(Number(e.target.value))} 
                className="form-input"
                style={{ fontSize: '18px', fontWeight: '800' }} 
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label className="form-label">Unit Price (₹)</label>
              <input 
                type="number" 
                value={singlePrice} 
                onChange={e => setSinglePrice(Number(e.target.value))} 
                className="form-input"
                style={{ fontSize: '18px', fontWeight: '800' }} 
              />
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {items.map((item, i) => (
              <div key={i} className="flex-between-center" style={{ gap: '12px' }}>
                <input 
                  placeholder="Item Name (e.g., Vegetables, Bread)" 
                  className="form-input"
                  style={{ flex: 1, borderRadius: '14px' }}
                  value={item.name}
                  onChange={e => {
                    const newItems = [...items];
                    newItems[i].name = e.target.value;
                    setItems(newItems);
                  }}
                />
                <input 
                  type="number" 
                  placeholder="Amount ₹" 
                  className="form-input"
                  style={{ width: '130px', borderRadius: '14px', fontWeight: '700' }}
                  value={item.amount || ''}
                  onChange={e => {
                    const newItems = [...items];
                    newItems[i].amount = Number(e.target.value);
                    setItems(newItems);
                  }}
                />
                <button 
                  onClick={() => {
                    if (items.length > 1) {
                      setItems(items.filter((_, idx) => idx !== i));
                    }
                  }} 
                  style={{ padding: '10px', border: 'none', background: 'none', color: '#EF4444', cursor: 'pointer', borderRadius: '10px' }}
                  title="Remove Item"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            
            <button 
              onClick={() => setItems([...items, { name: '', amount: 0, quantity: 1, price: 0 }])} 
              className="btn btn-secondary hover-lift"
              style={{ width: '100%', borderRadius: '14px', fontSize: '13px', fontWeight: '700', marginTop: '8px' }}
            >
              <Plus size={16} /> Add Line Item
            </button>
          </div>
        )}
      </div>

      {/* Total Card Display */}
      <div className="glass-card flex-between-center" style={{ padding: '28px', flexDirection: 'column', textAlign: 'center', gap: '14px', background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF0EB 100%)' }}>
        <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Calculated Total</span>
        <div style={{ fontSize: '42px', fontWeight: '800', color: 'var(--color-primary)', letterSpacing: '-1px' }}>
          {formatCurrency(total)}
        </div>
        
        <button 
          onClick={openModal} 
          disabled={total <= 0}
          className="btn btn-primary hover-lift"
          style={{ borderRadius: '14px', fontSize: '14px', fontWeight: '700', padding: '12px 28px', width: '100%', maxWidth: '320px' }}
        >
          <Save size={18} /> Save as Household Expense
        </button>
      </div>

      {/* Save Expense Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal" style={{ maxWidth: '440px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--color-text)', margin: 0 }}>Save to Expenses</h2>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '4px 0 20px 0' }}>Log this calculated bill straight into your household expense tracker.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="form-label">Expense Name</label>
                <input 
                  value={expenseName} 
                  onChange={e => setExpenseName(e.target.value)} 
                  className="form-input"
                  style={{ fontWeight: '700' }} 
                />
              </div>

              <div>
                <label className="form-label">Total Amount (₹)</label>
                <input 
                  type="number" 
                  value={total} 
                  readOnly 
                  className="form-input bg-bg-secondary"
                  style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-primary)' }} 
                />
              </div>

              <div>
                <label className="form-label">Category</label>
                <select 
                  value={selectedCategory} 
                  onChange={e => setSelectedCategory(e.target.value)} 
                  className="form-select"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button 
                onClick={() => setShowModal(false)} 
                className="btn btn-secondary"
                style={{ flex: 1, borderRadius: '12px' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveExpense} 
                className="btn btn-primary"
                style={{ flex: 1, borderRadius: '12px' }}
              >
                Save Expense
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
