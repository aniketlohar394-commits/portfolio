'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatCurrency, formatDate } from '@/lib/utils';
import Toast, { ToastType } from '@/components/Toast';
import { 
  AlertTriangle, 
  Plus, 
  Check, 
  Milk, 
  ShoppingCart, 
  Carrot, 
  MoreHorizontal,
  Wallet,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
  Zap,
  PackageCheck,
  Calendar,
  Layers,
  Flame,
  ShieldCheck
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');
  const [toast, setToast] = useState<{ message: string; type: ToastType; visible: boolean }>({
    message: '',
    type: 'info',
    visible: false
  });
  const [milkLoggedToday, setMilkLoggedToday] = useState(false);

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type, visible: true });
  };

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning ☀️');
    else if (hour < 18) setGreeting('Good Afternoon 🌤️');
    else setGreeting('Good Evening 🌙');

    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/dashboard');
      if (res.ok) {
        const json = await res.json();
        setData(json);
        const hasMilk = json.recentExpenses?.some((exp: any) => 
          exp.name.toLowerCase().includes('milk') && 
          new Date(exp.date).toDateString() === new Date().toDateString()
        );
        setMilkLoggedToday(!!hasMilk);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdd = async (name: string, amount: number, categoryId?: string) => {
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          amount,
          categoryId,
          date: new Date().toISOString(),
          paymentMethod: 'Cash',
          priority: 'Normal'
        })
      });
      if (res.ok) {
        showToast(`Added ${name} (${formatCurrency(amount)}) to expenses!`, 'success');
        fetchDashboardData();
      } else {
        showToast('Failed to log expense.', 'error');
      }
    } catch (error) {
      console.error('Failed to add quick expense', error);
      showToast('Error connecting to server.', 'error');
    }
  };

  const handleAddLowStockToShopping = async (itemName: string) => {
    try {
      const res = await fetch('/api/shopping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: itemName,
          quantity: '1 pkg',
          priority: 'High'
        })
      });
      if (res.ok) {
        showToast(`Added "${itemName}" to Shopping List!`, 'success');
      }
    } catch (error) {
      showToast('Failed to update shopping list.', 'error');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '8px' }}>
        <div className="skeleton" style={{ height: '128px', borderRadius: '24px' }}></div>
        <div className="grid-4-cols">
          <div className="skeleton" style={{ height: '112px', borderRadius: '20px' }}></div>
          <div className="skeleton" style={{ height: '112px', borderRadius: '20px' }}></div>
          <div className="skeleton" style={{ height: '112px', borderRadius: '20px' }}></div>
          <div className="skeleton" style={{ height: '112px', borderRadius: '20px' }}></div>
        </div>
        <div className="skeleton" style={{ height: '256px', borderRadius: '24px' }}></div>
      </div>
    );
  }

  // Calculate Chart data from recent expenses grouped by date
  const chartDataMap: { [key: string]: number } = {};
  if (data?.recentExpenses) {
    data.recentExpenses.forEach((exp: any) => {
      const d = new Date(exp.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      chartDataMap[d] = (chartDataMap[d] || 0) + exp.amount;
    });
  }
  const chartData = Object.keys(chartDataMap)
    .reverse()
    .slice(0, 7)
    .map(key => ({ date: key, amount: chartDataMap[key] }));

  const monthTotal = data?.monthTotal || 0;
  const monthlyBudget = data?.monthlyBudget || 20000;
  const progress = Math.min(100, Math.round((monthTotal / monthlyBudget) * 100));
  const remainingBudget = Math.max(0, monthlyBudget - monthTotal);

  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const currentDay = new Date().getDate();
  const daysRemaining = Math.max(1, daysInMonth - currentDay);
  const dailyAllowance = Math.round(remainingBudget / daysRemaining);

  let progressBg = 'from-emerald-500 to-teal-500';
  let progressBadge = 'badge-success';
  if (progress >= 100) {
    progressBg = 'from-rose-500 to-red-600';
    progressBadge = 'badge-danger';
  } else if (progress >= 80) {
    progressBg = 'from-amber-500 to-orange-500';
    progressBadge = 'badge-warning';
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '48px', maxWidth: '1150px', margin: '0 auto' }}>
      <Toast 
        message={toast.message} 
        type={toast.type} 
        visible={toast.visible} 
        onClose={() => setToast({ ...toast, visible: false })} 
      />

      {/* Hero Banner Header */}
      <div className="hero-banner flex-between-center" style={{ flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div className="badge badge-primary" style={{ alignSelf: 'flex-start', padding: '6px 12px', fontSize: '11px', fontWeight: 'bold' }}>
            <Sparkles size={13} /> Household Command Center
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--color-text)', letterSpacing: '-0.5px', margin: 0 }}>
            {greeting}
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: 0 }}>
            Your live daily expense tracking, pantry inventory, and budget health overview.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={() => router.push('/shopping')}
            className="btn btn-secondary hover-lift"
            style={{ borderRadius: '14px', fontSize: '13px', fontWeight: '700' }}
          >
            <ShoppingCart size={16} />
            <span>Shopping List</span>
          </button>
          <button 
            onClick={() => router.push('/expenses/add')}
            className="btn btn-primary hover-lift"
            style={{ borderRadius: '14px', fontSize: '13px', fontWeight: '700' }}
          >
            <Plus size={16} />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid-4-cols">
        {/* Today's Spend Card */}
        <div className="stat-card-widget flex-between-center" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
          <div className="flex-between-center" style={{ width: '100%', marginBottom: '12px' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Today's Spend</span>
            <div style={{ width: '40px', height: '40px', borderRadius: '14px', background: 'rgba(255, 107, 53, 0.1)', color: '#FF6B35', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={20} />
            </div>
          </div>
          <div>
            <p style={{ fontSize: '28px', fontWeight: '800', color: 'var(--color-text)', margin: 0 }}>
              {formatCurrency(data?.todayTotal || 0)}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px', fontWeight: '500' }}>
              {data?.expenseCount || 0} logged transaction{data?.expenseCount === 1 ? '' : 's'}
            </p>
          </div>
        </div>

        {/* Month Spend Card */}
        <div className="stat-card-widget flex-between-center" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
          <div className="flex-between-center" style={{ width: '100%', marginBottom: '12px' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Month Spend</span>
            <div style={{ width: '40px', height: '40px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div>
            <p style={{ fontSize: '28px', fontWeight: '800', color: 'var(--color-text)', margin: 0 }}>
              {formatCurrency(monthTotal)}
            </p>
            <span className={`badge ${progressBadge}`} style={{ marginTop: '6px', fontSize: '11px' }}>
              {progress}% of budget
            </span>
          </div>
        </div>

        {/* Remaining Budget Card */}
        <div className="stat-card-widget flex-between-center" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
          <div className="flex-between-center" style={{ width: '100%', marginBottom: '12px' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Remaining</span>
            <div style={{ width: '40px', height: '40px', borderRadius: '14px', background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wallet size={20} />
            </div>
          </div>
          <div>
            <p style={{ fontSize: '28px', fontWeight: '800', color: '#10B981', margin: 0 }}>
              {formatCurrency(remainingBudget)}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px', fontWeight: '500' }}>
              Limit: {formatCurrency(monthlyBudget)}
            </p>
          </div>
        </div>

        {/* Low Stock Card */}
        <div className="stat-card-widget flex-between-center" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
          <div className="flex-between-center" style={{ width: '100%', marginBottom: '12px' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Low Stock</span>
            <div style={{ width: '40px', height: '40px', borderRadius: '14px', background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <div>
            <p style={{ fontSize: '28px', fontWeight: '800', color: 'var(--color-text)', margin: 0 }}>
              {data?.lowStockItems?.length || 0}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px', fontWeight: '500' }}>
              Items to replenish
            </p>
          </div>
        </div>
      </div>

      {/* Monthly Budget Progress Widget */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="flex-between-center" style={{ flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-text)', margin: 0 }}>Monthly Budget Planner</h3>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px', margin: 0 }}>
              Recommended daily allowance for remaining {daysRemaining} day{daysRemaining === 1 ? '' : 's'}: <strong style={{ color: 'var(--color-text)' }}>{formatCurrency(dailyAllowance)}/day</strong>
            </p>
          </div>

          <button 
            onClick={() => router.push('/budget')}
            style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            Manage Budget <ArrowUpRight size={14} />
          </button>
        </div>

        <div className="progress-bar progress-bar-lg">
          <div 
            className="progress-fill"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="flex-between-center" style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-text-secondary)' }}>
          <span>Spent: {formatCurrency(monthTotal)}</span>
          <span>Target: {formatCurrency(monthlyBudget)}</span>
        </div>
      </div>

      {/* Instant Quick Logging Section & Milk Tracker Widget */}
      <div className="grid-3-layout">
        {/* Instant Quick Logging Grid - Side by Side */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="flex-between-center">
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-text)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={18} color="var(--color-primary)" /> Instant Quick Logging
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Tap to record instantly</span>
          </div>

          {/* Quick Action Tiles Grid (Side by side 4-column layout) */}
          <div className="quick-logging-grid">
            <button 
              onClick={() => handleQuickAdd('Milk 1L', 60)} 
              className="quick-tile hover-lift"
            >
              <div className="quick-tile-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' }}>
                <Milk size={22} />
              </div>
              <div>
                <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--color-text)', display: 'block' }}>Milk 1L</span>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>₹60</span>
              </div>
            </button>

            <button 
              onClick={() => router.push('/expenses/add?name=Vegetables')} 
              className="quick-tile hover-lift"
            >
              <div className="quick-tile-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
                <Carrot size={22} />
              </div>
              <div>
                <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--color-text)', display: 'block' }}>Vegetables</span>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>Custom</span>
              </div>
            </button>

            <button 
              onClick={() => router.push('/expenses/add?name=Grocery')} 
              className="quick-tile hover-lift"
            >
              <div className="quick-tile-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' }}>
                <ShoppingCart size={22} />
              </div>
              <div>
                <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--color-text)', display: 'block' }}>Grocery</span>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>Custom</span>
              </div>
            </button>

            <button 
              onClick={() => router.push('/expenses/add')} 
              className="quick-tile hover-lift"
            >
              <div className="quick-tile-icon" style={{ background: 'rgba(100, 116, 139, 0.1)', color: '#64748B' }}>
                <MoreHorizontal size={22} />
              </div>
              <div>
                <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--color-text)', display: 'block' }}>Other</span>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>Custom</span>
              </div>
            </button>
          </div>
        </div>

        {/* Milk Tracker Card */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
          <div className="flex-between-center">
            <div className="flex-row-gap">
              <div style={{ width: '40px', height: '40px', borderRadius: '14px', background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Milk size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-text)', margin: 0 }}>Milk Log</h3>
                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>Daily household milk</p>
              </div>
            </div>
            <button onClick={() => router.push('/milk')} style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer' }}>
              Calendar
            </button>
          </div>

          <div style={{ padding: '16px', borderRadius: '16px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-text)', margin: 0 }}>Today's Delivery</p>
              <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '2px', margin: 0 }}>
                {milkLoggedToday ? 'Recorded for today ✅' : 'Not recorded yet'}
              </p>
            </div>

            <button 
              onClick={() => {
                if (!milkLoggedToday) {
                  handleQuickAdd('Milk Daily Delivery', 60);
                  setMilkLoggedToday(true);
                } else {
                  showToast('Milk already recorded today!', 'info');
                }
              }}
              className={`btn btn-sm ${milkLoggedToday ? 'btn-secondary' : 'btn-primary'}`}
              style={{ borderRadius: '12px', fontSize: '12px', fontWeight: '700' }}
            >
              <Check size={14} />
              {milkLoggedToday ? 'Logged' : 'Mark Delivered'}
            </button>
          </div>
        </div>
      </div>

      {/* Spending Trend Chart & Low Stock Alerts Grid */}
      <div className="grid-3-layout">
        {/* Spending Trend Area Chart */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="flex-between-center">
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-text)', margin: 0 }}>Spending Trend</h3>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>Past 7 days spending history</p>
            </div>
            <button 
              onClick={() => router.push('/reports')} 
              style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              Analytics <ArrowUpRight size={14} />
            </button>
          </div>

          <div style={{ height: '240px', width: '100%', paddingTop: '8px' }}>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="date" stroke="var(--color-text-secondary)" fontSize={12} tickLine={false} />
                  <YAxis stroke="var(--color-text-secondary)" fontSize={12} tickLine={false} />
                  <Tooltip 
                    formatter={(val: any) => [`₹${val}`, 'Spending']}
                    contentStyle={{ 
                      backgroundColor: 'var(--color-surface)', 
                      borderColor: 'var(--color-border)', 
                      borderRadius: '14px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      color: 'var(--color-text)' 
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="var(--color-primary)" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorSpend)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                No spending records logged yet.
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Alerts Box */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="flex-between-center">
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-text)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} color="var(--color-warning)" /> Low Stock Items
            </h3>
            <button onClick={() => router.push('/inventory')} style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer' }}>
              Inventory
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, overflowY: 'auto', maxHeight: '250px' }}>
            {!data?.lowStockItems || data.lowStockItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--color-text-secondary)', fontSize: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <PackageCheck size={36} color="var(--color-secondary)" />
                <span style={{ fontWeight: '700', color: 'var(--color-text)' }}>Pantry Stock Healthy!</span>
                <span>No items below threshold limit.</span>
              </div>
            ) : (
              data.lowStockItems.map((item: any) => (
                <div 
                  key={item.id} 
                  className="flex-between-center"
                  style={{ padding: '12px 16px', borderRadius: '16px', background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                >
                  <div>
                    <p style={{ fontWeight: '700', color: 'var(--color-text)', fontSize: '13px', margin: 0 }}>{item.name}</p>
                    <p style={{ fontSize: '11px', color: 'var(--color-danger)', fontWeight: '600', margin: '2px 0 0 0' }}>Only {item.currentQuantity} {item.unit || 'units'} left</p>
                  </div>
                  <button 
                    onClick={() => handleAddLowStockToShopping(item.name)}
                    className="btn btn-sm btn-primary"
                    style={{ borderRadius: '10px', fontSize: '11px', padding: '4px 10px' }}
                  >
                    + Buy
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions Feed */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="flex-between-center">
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-text)', margin: 0 }}>Recent Transactions</h3>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>Logged household expenses feed</p>
          </div>
          <button 
            onClick={() => router.push('/expenses')} 
            style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            View All ({data?.recentExpenses?.length || 0}) <ArrowUpRight size={14} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {!data?.recentExpenses || data.recentExpenses.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-secondary)', fontSize: '14px' }}>No expenses recorded yet.</p>
          ) : (
            data.recentExpenses.slice(0, 5).map((exp: any) => (
              <div 
                key={exp.id} 
                className="flex-between-center hover-lift"
                style={{ padding: '14px', borderRadius: '14px', cursor: 'pointer', borderBottom: '1px solid var(--color-border)' }}
                onClick={() => router.push(`/expenses`)}
              >
                <div className="flex-row-gap" style={{ gap: '12px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: 'var(--color-primary-lighter)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '18px' }}>
                    {exp.category?.icon || '🛒'}
                  </div>
                  <div>
                    <p style={{ fontWeight: '700', color: 'var(--color-text)', fontSize: '14px', margin: 0 }}>{exp.name}</p>
                    <div className="flex-row-gap" style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                      <span>{formatDate(exp.date)}</span>
                      <span>•</span>
                      <span className="badge badge-primary" style={{ fontSize: '10px' }}>{exp.category?.name || 'General'}</span>
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: '800', color: 'var(--color-text)', fontSize: '16px', margin: 0 }}>{formatCurrency(exp.amount)}</p>
                  <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: '2px 0 0 0', fontWeight: '500' }}>{exp.paymentMethod || 'Cash'}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
