'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, 
  ChevronRight, 
  Settings, 
  Check, 
  X, 
  Droplets, 
  Calendar as CalendarIcon,
  Store,
  AlertCircle,
  AlertTriangle,
  RotateCcw,
  Plus,
  Edit2,
  Save
} from 'lucide-react';
import { formatCurrency, getDaysInMonth, getMonthName } from '@/lib/utils';
import Toast, { ToastType } from '@/components/Toast';

interface Delivery {
  id: string;
  date: string;
  status: string;
  quantity: number;
  pricePerLitre: number;
  totalAmount: number;
}

interface Summary {
  daysInMonth: number;
  daysDelivered: number;
  daysNotDelivered: number;
  totalQuantity: number;
  totalSpent: number;
  averageDaily: number;
  currentPrice: number;
  activeVendor: {
    id: string;
    name: string;
    pricePerLitre: number;
    defaultQuantity: number;
  } | null;
}

export default function MilkTrackerPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType; visible: boolean }>({
    message: '',
    type: 'info',
    visible: false
  });

  // Quick Vendor Setup Form State (when no active vendor exists)
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [vendorName, setVendorName] = useState('');
  const [vendorPrice, setVendorPrice] = useState('60');
  const [vendorQty, setVendorQty] = useState('1');
  const [isSavingVendor, setIsSavingVendor] = useState(false);

  // Custom Delivery Log Modal State
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [modalStatus, setModalStatus] = useState<string>('delivered');
  const [modalQty, setModalQty] = useState<string>('1.0');
  const [isSavingDelivery, setIsSavingDelivery] = useState(false);

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type, visible: true });
  };

  const fetchMonthData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [deliveriesRes, summaryRes] = await Promise.all([
        fetch(`/api/milk/deliveries?month=${month}&year=${year}`),
        fetch(`/api/milk/summary?month=${month}&year=${year}`)
      ]);

      if (!deliveriesRes.ok) {
        const errData = await deliveriesRes.json().catch(() => ({}));
        const msg = errData.error || `Failed to fetch deliveries (Status ${deliveriesRes.status})`;
        setErrorMessage(msg);
        showToast(msg, 'error');
        setIsLoading(false);
        return;
      }

      if (!summaryRes.ok) {
        const errData = await summaryRes.json().catch(() => ({}));
        const msg = errData.error || `Failed to fetch milk summary (Status ${summaryRes.status})`;
        setErrorMessage(msg);
        showToast(msg, 'error');
        setIsLoading(false);
        return;
      }

      const deliveriesData = await deliveriesRes.json();
      const summaryData = await summaryRes.json();
      setDeliveries(deliveriesData || []);
      setSummary(summaryData);
    } catch (error: any) {
      console.error('Error fetching milk data:', error);
      const msg = error?.message || 'Error connecting to server. Please try again.';
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthData();
  }, [month, year]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Create Quick Vendor directly on the page
  const handleCreateQuickVendor = async () => {
    if (!vendorName.trim()) {
      showToast('Please enter vendor name', 'warning');
      return;
    }
    if (!vendorPrice || Number(vendorPrice) <= 0) {
      showToast('Please enter a valid price per litre', 'warning');
      return;
    }
    if (!vendorQty || Number(vendorQty) <= 0) {
      showToast('Please enter a valid default quantity', 'warning');
      return;
    }

    setIsSavingVendor(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/milk/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: vendorName.trim(),
          pricePerLitre: Number(vendorPrice),
          defaultQuantity: Number(vendorQty),
          isActive: true
        })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = data.error || 'Failed to create vendor.';
        setErrorMessage(msg);
        showToast(msg, 'error');
        return;
      }

      showToast(`Vendor '${vendorName}' added successfully! You can now track deliveries.`, 'success');
      setShowVendorModal(false);
      setVendorName('');
      fetchMonthData();
    } catch (error: any) {
      console.error('Error adding vendor:', error);
      const msg = error?.message || 'Error creating vendor.';
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setIsSavingVendor(false);
    }
  };

  const handleRecordDelivery = async (date: Date, status: string, customQty?: number) => {
    if (!summary?.activeVendor) {
      setShowVendorModal(true);
      showToast('Please set up a vendor first to log milk deliveries.', 'warning');
      return;
    }
    
    setErrorMessage(null);
    try {
      const { id, pricePerLitre, defaultQuantity } = summary.activeVendor;
      const qty = status === 'delivered' ? (customQty !== undefined ? customQty : defaultQuantity) : 0;
      
      const res = await fetch('/api/milk/deliveries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId: id,
          date: date.toISOString(),
          status,
          quantity: qty,
          pricePerLitre,
        })
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        showToast(
          status === 'delivered' 
            ? `Recorded ${qty}L milk delivery for ${date.getDate()} ${getMonthName(month)}!` 
            : `Marked as Not Delivered for ${date.getDate()} ${getMonthName(month)}.`,
          'success'
        );
        setSelectedDate(null);
        fetchMonthData();
      } else {
        const msg = data.error || `Error recording delivery (Status ${res.status})`;
        setErrorMessage(msg);
        showToast(msg, 'error');
      }
    } catch (error: any) {
      console.error('Error recording delivery:', error);
      const msg = error?.message || 'Network error saving delivery record.';
      setErrorMessage(msg);
      showToast(msg, 'error');
    }
  };

  const openDateModal = (cellDate: Date, delivery?: Delivery) => {
    if (!summary?.activeVendor) {
      setShowVendorModal(true);
      return;
    }
    setSelectedDate(cellDate);
    if (delivery) {
      setModalStatus(delivery.status);
      setModalQty(String(delivery.quantity || summary.activeVendor.defaultQuantity));
    } else {
      setModalStatus('delivered');
      setModalQty(String(summary.activeVendor.defaultQuantity || 1));
    }
  };

  const today = new Date();
  const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;
  const todayDelivery = isCurrentMonth ? deliveries.find(d => {
    const dDate = new Date(d.date);
    return dDate.getUTCDate() === today.getDate() || dDate.getDate() === today.getDate();
  }) : null;

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = getDaysInMonth(year, month);
  const calendarDays = Array.from({ length: 42 }, (_, i) => {
    const dayNumber = i - firstDayOfMonth + 1;
    if (dayNumber > 0 && dayNumber <= daysInMonth) {
      return dayNumber;
    }
    return null;
  });

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
            <Droplets size={13} /> Milk Tracker
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--color-text)', letterSpacing: '-0.5px', margin: 0 }}>
            Daily Milk Deliveries
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: 0 }}>
            Monitor daily milk deliveries, monthly volume, and vendor billing logs.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {!summary?.activeVendor && (
            <button 
              onClick={() => setShowVendorModal(true)}
              className="btn btn-primary hover-lift"
              style={{ borderRadius: '14px', fontSize: '13px', fontWeight: '700', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={18} />
              <span>Setup Vendor</span>
            </button>
          )}
          <Link 
            href="/milk/settings" 
            className="btn btn-secondary hover-lift"
            style={{ borderRadius: '14px', fontSize: '13px', fontWeight: '700', padding: '12px 20px', textDecoration: 'none' }}
          >
            <Settings size={18} />
            <span>Vendor Settings</span>
          </Link>
        </div>
      </div>

      {/* Error Alert Display Banner */}
      {errorMessage && (
        <div style={{ padding: '16px 20px', borderLeft: '4px solid #EF4444', background: 'rgba(239, 68, 68, 0.1)', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '14px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertCircle size={22} color="#DC2626" />
            <div>
              <strong style={{ fontSize: '14px', display: 'block' }}>Milk Tracker Notice</strong>
              <span style={{ fontSize: '13px' }}>{errorMessage}</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              onClick={fetchMonthData} 
              className="btn btn-sm"
              style={{ background: '#DC2626', color: 'white', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
            >
              <RotateCcw size={14} /> Retry
            </button>
            <button 
              onClick={() => setErrorMessage(null)} 
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', padding: '4px' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Setup Vendor Inline Prompt (When no vendor exists) */}
      {!isLoading && summary && !summary.activeVendor && (
        <div className="glass-card" style={{ padding: '24px', borderLeft: '4px solid var(--color-primary)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Store size={24} color="var(--color-primary)" />
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0, color: 'var(--color-text)' }}>Welcome to Milk Tracker!</h3>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '2px 0 0 0' }}>Please enter your milk vendor details below to enable delivery logging.</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginTop: '8px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '6px', color: 'var(--color-text)' }}>Vendor Name *</label>
              <input 
                type="text" 
                placeholder="e.g., Amul Dairy / Gokul" 
                value={vendorName} 
                onChange={e => setVendorName(e.target.value)} 
                className="form-input"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--color-border)' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '6px', color: 'var(--color-text)' }}>Price / Litre (₹) *</label>
              <input 
                type="number" 
                placeholder="60" 
                value={vendorPrice} 
                onChange={e => setVendorPrice(e.target.value)} 
                className="form-input"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--color-border)' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '6px', color: 'var(--color-text)' }}>Default Daily Qty (L) *</label>
              <input 
                type="number" 
                step="0.5" 
                placeholder="1" 
                value={vendorQty} 
                onChange={e => setVendorQty(e.target.value)} 
                className="form-input"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--color-border)' }}
              />
            </div>
          </div>

          <button 
            onClick={handleCreateQuickVendor}
            disabled={isSavingVendor}
            className="btn btn-primary hover-lift"
            style={{ borderRadius: '12px', padding: '12px 24px', fontWeight: '800', alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}
          >
            <Check size={18} />
            <span>{isSavingVendor ? 'Saving Vendor...' : 'Save Vendor & Enable Tracker'}</span>
          </button>
        </div>
      )}

      {/* Quick Vendor Modal */}
      {showVendorModal && (
        <div className="modal-backdrop">
          <div className="modal" style={{ maxWidth: '420px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--color-text)', margin: 0 }}>Add Milk Vendor</h2>
              <button onClick={() => setShowVendorModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="form-label">Vendor Name *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Amul / Local Dairy" 
                  value={vendorName} 
                  onChange={e => setVendorName(e.target.value)} 
                  className="form-input" 
                />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Price/Litre (₹) *</label>
                  <input 
                    type="number" 
                    placeholder="60" 
                    value={vendorPrice} 
                    onChange={e => setVendorPrice(e.target.value)} 
                    className="form-input" 
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Default Qty (L) *</label>
                  <input 
                    type="number" 
                    step="0.5" 
                    placeholder="1" 
                    value={vendorQty} 
                    onChange={e => setVendorQty(e.target.value)} 
                    className="form-input" 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button onClick={() => setShowVendorModal(false)} className="btn btn-secondary" style={{ flex: 1, borderRadius: '12px' }}>Cancel</button>
                <button onClick={handleCreateQuickVendor} disabled={isSavingVendor} className="btn btn-primary" style={{ flex: 1, borderRadius: '12px' }}>
                  {isSavingVendor ? 'Saving...' : 'Save Vendor'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Date Log / Edit Modal */}
      {selectedDate && summary?.activeVendor && (
        <div className="modal-backdrop">
          <div className="modal" style={{ maxWidth: '400px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-text)', margin: 0 }}>
                Log Milk ({selectedDate.getDate()} {getMonthName(month)})
              </h2>
              <button onClick={() => setSelectedDate(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="form-label">Status *</label>
                <select 
                  value={modalStatus} 
                  onChange={e => setModalStatus(e.target.value)} 
                  className="form-input"
                  style={{ width: '100%' }}
                >
                  <option value="delivered">Delivered</option>
                  <option value="not_delivered">Not Delivered / Skipped</option>
                </select>
              </div>

              {modalStatus === 'delivered' && (
                <div>
                  <label className="form-label">Quantity in Litres (L) *</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    value={modalQty} 
                    onChange={e => setModalQty(e.target.value)} 
                    className="form-input"
                    placeholder="1.0" 
                  />
                  <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px', display: 'block' }}>
                    Rate: ₹{summary.activeVendor.pricePerLitre}/L • Total: {formatCurrency(Number(modalQty || 0) * summary.activeVendor.pricePerLitre)}
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button onClick={() => setSelectedDate(null)} className="btn btn-secondary" style={{ flex: 1, borderRadius: '12px' }}>Cancel</button>
                <button 
                  onClick={() => handleRecordDelivery(selectedDate, modalStatus, Number(modalQty))} 
                  className="btn btn-primary" 
                  style={{ flex: 1, borderRadius: '12px' }}
                >
                  Save Log
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Month Navigator */}
      <div className="glass-card flex-between-center" style={{ padding: '16px 20px' }}>
        <button 
          onClick={handlePrevMonth} 
          className="btn btn-secondary btn-sm"
          style={{ borderRadius: '12px', width: '40px', height: '40px', padding: 0 }}
          aria-label="Previous month"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex-row-gap" style={{ gap: '8px' }}>
          <CalendarIcon size={18} color="var(--color-primary)" />
          <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-text)' }}>
            {getMonthName(month)} {year}
          </span>
        </div>

        <button 
          onClick={handleNextMonth} 
          className="btn btn-secondary btn-sm"
          style={{ borderRadius: '12px', width: '40px', height: '40px', padding: 0 }}
          aria-label="Next month"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Today's Quick Action Card (With 3 Buttons: 1L, 0.5L, Not Delivered Today) */}
      {isCurrentMonth && (
        <div className="glass-card" style={{ padding: '24px', borderLeft: '4px solid var(--color-primary)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="flex-between-center">
            <h3 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-text-secondary)', textTransform: 'uppercase', margin: 0 }}>
              Today's Delivery ({today.getDate()} {getMonthName(month)})
            </h3>
            {summary?.activeVendor && (
              <span className="badge badge-primary font-bold" style={{ fontSize: '11px' }}>
                {summary.activeVendor.name} (Rate: ₹{summary.activeVendor.pricePerLitre}/L)
              </span>
            )}
          </div>

          {/* 3 Quick Action Buttons: 1L, 0.5L, Not Delivered Today */}
          <div className="grid-3-layout" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            <button 
              onClick={() => handleRecordDelivery(today, 'delivered', 1.0)}
              className={`btn hover-lift ${todayDelivery?.status === 'delivered' && todayDelivery.quantity === 1.0 ? 'btn-primary' : 'btn-success'}`}
              style={{ borderRadius: '14px', padding: '14px', fontSize: '14px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <Check size={18} />
              <span>1L</span>
            </button>

            <button 
              onClick={() => handleRecordDelivery(today, 'delivered', 0.5)}
              className={`btn hover-lift ${todayDelivery?.status === 'delivered' && todayDelivery.quantity === 0.5 ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: '14px', padding: '14px', fontSize: '14px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <Check size={18} />
              <span>0.5L</span>
            </button>

            <button 
              onClick={() => handleRecordDelivery(today, 'not_delivered', 0)}
              className={`btn hover-lift ${todayDelivery?.status === 'not_delivered' ? 'btn-primary' : 'btn-danger'}`}
              style={{ borderRadius: '14px', padding: '14px', fontSize: '14px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <X size={18} />
              <span>Not Delivered Today</span>
            </button>
          </div>

          {todayDelivery && (
            <div style={{ padding: '12px 16px', borderRadius: '14px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', fontSize: '13px', fontWeight: '700', color: 'var(--color-text)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>
                Status: {todayDelivery.status === 'delivered' ? `✅ Received ${todayDelivery.quantity}L` : '❌ Not Delivered Today'}
              </span>
              {todayDelivery.status === 'delivered' && (
                <span style={{ color: 'var(--color-primary)' }}>
                  Total: {formatCurrency(todayDelivery.totalAmount)}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Calendar Grid */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-text)', margin: 0 }}>Monthly Delivery Calendar</h3>
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Click any day to log or edit custom quantity</span>
        </div>
        
        {/* Calendar Day Header */}
        <div className="calendar-header-row">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        {/* Calendar Grid Cells */}
        <div className="milk-calendar-grid">
          {calendarDays.map((dayNum, i) => {
            if (!dayNum) return <div key={i} style={{ aspectRatio: '1 / 1' }}></div>;
            const cellDate = new Date(year, month, dayNum);
            const isFuture = cellDate > today;
            const isTodayCell = isCurrentMonth && dayNum === today.getDate();
            const delivery = deliveries.find(d => {
              const dDate = new Date(d.date);
              return dDate.getUTCDate() === dayNum || dDate.getDate() === dayNum;
            });

            let dayStatusClass = '';
            if (isFuture) {
              dayStatusClass = 'calendar-day-disabled';
            } else if (delivery?.status === 'delivered') {
              dayStatusClass = 'calendar-day-delivered';
            } else if (delivery?.status === 'not_delivered') {
              dayStatusClass = 'calendar-day-skipped';
            }

            return (
              <button 
                key={i} 
                disabled={isFuture}
                onClick={() => {
                  if (!isFuture) {
                    openDateModal(cellDate, delivery);
                  }
                }}
                className={`calendar-day-cell ${dayStatusClass} ${isTodayCell ? 'calendar-day-today' : ''}`}
                title={!isFuture ? `Click to log delivery for ${dayNum} ${getMonthName(month)}` : ''}
              >
                <span>{dayNum}</span>
                {!isFuture && delivery?.status === 'delivered' && (
                  <span style={{ fontSize: '10px', fontWeight: '800' }}>{delivery.quantity}L</span>
                )}
                {!isFuture && delivery?.status === 'not_delivered' && <X size={14} color="#DC2626" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Monthly Summary Statistics Grid */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-text)', margin: 0 }}>Monthly Summary & Vendor Details</h3>

        {summary && (
          <div className="grid-4-cols">
            <div className="stat-card-widget">
              <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Days Delivered</span>
              <p style={{ fontSize: '22px', fontWeight: '800', color: 'var(--color-text)', margin: '4px 0 0 0' }}>
                {summary.daysDelivered} / {summary.daysInMonth}
              </p>
            </div>

            <div className="stat-card-widget">
              <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Total Quantity</span>
              <p style={{ fontSize: '22px', fontWeight: '800', color: '#3B82F6', margin: '4px 0 0 0' }}>
                {summary.totalQuantity} Litres
              </p>
            </div>

            <div className="stat-card-widget">
              <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Total Bill</span>
              <p style={{ fontSize: '22px', fontWeight: '800', color: '#EF4444', margin: '4px 0 0 0' }}>
                {formatCurrency(summary.totalSpent)}
              </p>
            </div>

            <div className="stat-card-widget">
              <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Daily Avg</span>
              <p style={{ fontSize: '22px', fontWeight: '800', color: '#10B981', margin: '4px 0 0 0' }}>
                {summary.averageDaily} L
              </p>
            </div>
          </div>
        )}

        {summary?.activeVendor && (
          <div className="flex-between-center" style={{ paddingTop: '16px', borderTop: '1px solid var(--color-border)', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
            <div className="flex-row-gap" style={{ gap: '8px' }}>
              <Store size={16} color="var(--color-primary)" />
              <span>Active Vendor: <strong style={{ color: 'var(--color-text)' }}>{summary.activeVendor.name}</strong></span>
            </div>
            <div>
              Rate: <strong style={{ color: 'var(--color-text)' }}>{formatCurrency(summary.activeVendor.pricePerLitre)}/L</strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
