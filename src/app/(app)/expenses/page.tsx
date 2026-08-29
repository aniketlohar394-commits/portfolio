'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Plus, Search, Filter, Wallet, ArrowUpRight, Calendar, Tag, CreditCard, TrendingUp, Sparkles, Receipt } from 'lucide-react';

export default function ExpensesPage() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [timeFilter, setTimeFilter] = useState('This Month');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetchExpenses();
  }, [search]);

  const fetchExpenses = async () => {
    try {
      const res = await fetch(`/api/expenses?search=${encodeURIComponent(search)}`);
      if (res.ok) {
        const data = await res.json();
        setExpenses(data.expenses || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filters = ['Today', 'This Week', 'This Month', 'All'];

  const filteredExpenses = expenses.filter((exp: any) => {
    // Category Filter
    if (selectedCategory !== 'All' && exp.category?.name !== selectedCategory) {
      return false;
    }

    // Time Filter
    if (timeFilter === 'Today') {
      return new Date(exp.date).toDateString() === new Date().toDateString();
    }
    if (timeFilter === 'This Week') {
      const now = new Date();
      const weekAgo = new Date(now.setDate(now.getDate() - 7));
      return new Date(exp.date) >= weekAgo;
    }
    if (timeFilter === 'This Month') {
      const now = new Date();
      const expDate = new Date(exp.date);
      return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
    }
    return true;
  });

  const totalAmount = filteredExpenses.reduce((s, e: any) => s + e.amount, 0);
  const averageAmount = filteredExpenses.length > 0 ? Math.round(totalAmount / filteredExpenses.length) : 0;

  // Extract unique category names
  const categoryNames = Array.from(new Set(expenses.map((e: any) => e.category?.name).filter(Boolean)));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '48px', maxWidth: '1150px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div className="hero-banner flex-between-center" style={{ flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div className="badge badge-primary" style={{ alignSelf: 'flex-start', padding: '6px 12px', fontSize: '11px', fontWeight: 'bold' }}>
            <Receipt size={13} /> Expense Auditor
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--color-text)', letterSpacing: '-0.5px', margin: 0 }}>
            Household Expenses
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: 0 }}>
            Track, filter, and audit your logged household expenditures in real-time.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '10px 18px', borderRadius: '16px', background: '#FFFFFF', border: '1px solid #E2E8F0', textAlign: 'right' }}>
            <p style={{ fontSize: '10px', fontWeight: '800', color: 'var(--color-text-secondary)', textTransform: 'uppercase', margin: 0 }}>Total ({timeFilter})</p>
            <p style={{ fontSize: '22px', fontWeight: '800', color: 'var(--color-primary)', margin: 0 }}>{formatCurrency(totalAmount)}</p>
          </div>

          <button 
            onClick={() => router.push('/expenses/add')}
            className="btn btn-primary hover-lift"
            style={{ borderRadius: '14px', fontSize: '13px', fontWeight: '700', padding: '12px 20px' }}
          >
            <Plus size={18} />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Expense Summary Metric Widgets */}
      <div className="grid-3-layout" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <div className="stat-card-widget">
          <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Filtered Spend</span>
          <p style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-primary)', margin: '4px 0 0 0' }}>{formatCurrency(totalAmount)}</p>
        </div>

        <div className="stat-card-widget">
          <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Entries</span>
          <p style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-text)', margin: '4px 0 0 0' }}>{filteredExpenses.length} transactions</p>
        </div>

        <div className="stat-card-widget">
          <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Average / Expense</span>
          <p style={{ fontSize: '24px', fontWeight: '800', color: '#10B981', margin: '4px 0 0 0' }}>{formatCurrency(averageAmount)}</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={18} color="var(--color-text-secondary)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search by expense name, category, or payment method..." 
            className="form-input"
            style={{ paddingLeft: '44px', background: 'var(--color-bg)', borderRadius: '14px' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex-between-center" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <div className="flex-row-gap" style={{ flexWrap: 'wrap', gap: '8px' }}>
            <Filter size={16} color="var(--color-text-secondary)" />
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-text-secondary)' }}>Timeframe:</span>
            {filters.map(f => (
              <button 
                key={f}
                onClick={() => setTimeFilter(f)}
                className={`btn btn-sm ${timeFilter === f ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: '12px', fontSize: '12px', fontWeight: '700', padding: '6px 14px' }}
              >
                {f}
              </button>
            ))}
          </div>

          {categoryNames.length > 0 && (
            <div className="flex-row-gap" style={{ gap: '8px' }}>
              <Tag size={14} color="var(--color-text-secondary)" />
              <select 
                value={selectedCategory} 
                onChange={e => setSelectedCategory(e.target.value)}
                className="form-select"
                style={{ fontSize: '12px', padding: '6px 32px 6px 12px', height: 'auto', minHeight: '0', borderRadius: '12px' }}
              >
                <option value="All">All Categories</option>
                {categoryNames.map((cat: any) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Expenses Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="skeleton" style={{ height: '72px', borderRadius: '18px' }}></div>
            ))}
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '48px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255, 107, 53, 0.1)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>
              💸
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-text)', margin: 0 }}>No Expenses Found</h3>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px', maxWidth: '380px' }}>
                No transactions match your search filter for "{timeFilter}". Try adjusting your search query or log a new expense.
              </p>
            </div>
            <button 
              onClick={() => router.push('/expenses/add')}
              className="btn btn-primary hover-lift"
              style={{ borderRadius: '14px', fontSize: '13px', fontWeight: '700', padding: '10px 20px' }}
            >
              <Plus size={16} /> Log Expense Now
            </button>
          </div>
        ) : (
          filteredExpenses.map((exp: any) => (
            <div 
              key={exp.id} 
              className="glass-card flex-between-center hover-lift"
              style={{ padding: '16px 20px', borderRadius: '18px', cursor: 'pointer', transition: 'all 200ms ease' }}
              onClick={() => router.push(`/expenses/add?id=${exp.id}`)}
            >
              <div className="flex-row-gap" style={{ gap: '14px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'var(--color-primary-lighter)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '20px', flexShrink: 0 }}>
                  {exp.category?.icon || '🧾'}
                </div>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--color-text)', margin: 0 }}>{exp.name}</h4>
                  <div className="flex-row-gap" style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px', gap: '8px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} /> {formatDate(exp.date)}
                    </span>
                    <span>•</span>
                    <span className="badge badge-primary" style={{ fontSize: '10px' }}>
                      {exp.category?.name || 'General'}
                    </span>
                    {exp.paymentMethod && (
                      <>
                        <span>•</span>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{exp.paymentMethod}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-text)', margin: 0 }}>{formatCurrency(exp.amount)}</p>
                <span style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '2px', marginTop: '2px' }}>
                  Edit <ArrowUpRight size={12} />
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
