'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, Trash2, Plus, Minus, ShoppingCart, Calendar, Building, Info, TrendingUp, History, AlertTriangle, AlertOctagon, CheckCircle2 } from 'lucide-react';
import { formatCurrency, formatDate, getStockStatus } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Toast, { ToastType } from '@/components/Toast';

export default function InventoryItemDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: ToastType; visible: boolean }>({
    message: '',
    type: 'info',
    visible: false
  });

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUseModal, setShowUseModal] = useState(false);

  // Transaction form states
  const [qty, setQty] = useState('');
  const [price, setPrice] = useState('');
  const [notes, setNotes] = useState('');

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type, visible: true });
  };

  useEffect(() => {
    fetchItem();
  }, [id]);

  const fetchItem = async () => {
    try {
      const res = await fetch(`/api/inventory/${id}`);
      if (res.ok) {
        const data = await res.json();
        setItem(data);
      } else {
        router.push('/inventory');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleTransaction = async (type: 'purchase' | 'consume') => {
    if (!qty || parseFloat(qty) <= 0) return;

    try {
      const res = await fetch(`/api/inventory/${id}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          quantity: qty,
          pricePerUnit: price ? parseFloat(price) : undefined,
          notes
        }),
      });

      if (res.ok) {
        showToast(type === 'purchase' ? `Added ${qty} ${item.unit} to stock!` : `Used ${qty} ${item.unit} from stock!`, 'info');
        setShowAddModal(false);
        setShowUseModal(false);
        setQty('');
        setPrice('');
        setNotes('');
        fetchItem();
      }
    } catch (e) {
      console.error(e);
      showToast('Failed to update stock', 'error');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this inventory item?')) return;
    try {
      const res = await fetch(`/api/inventory/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Deleted item.', 'info');
        setTimeout(() => router.push('/inventory'), 400);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddToList = async () => {
    try {
      const res = await fetch('/api/shopping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: item.name,
          inventoryItemId: item.id,
          unit: item.unit,
        }),
      });
      if (res.ok) {
        showToast(`Added "${item.name}" to Shopping List!`, 'success');
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '16px', maxWidth: '800px', margin: '0 auto' }}>
        <div className="skeleton" style={{ height: '80px', borderRadius: '20px' }}></div>
        <div className="skeleton" style={{ height: '180px', borderRadius: '24px' }}></div>
        <div className="skeleton" style={{ height: '180px', borderRadius: '24px' }}></div>
      </div>
    );
  }

  if (!item) return null;

  const status = getStockStatus(item.currentQuantity, item.minimumQuantity);
  const chartData = [...(item.priceHistory || [])].reverse().map((ph: any) => ({
    date: new Date(ph.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
    price: ph.price
  }));

  const getStatusBadge = () => {
    if (status === 'out_of_stock') {
      return (
        <span className="badge badge-danger flex-row-gap" style={{ padding: '6px 14px', fontSize: '12px' }}>
          <AlertOctagon size={14} /> Out of Stock
        </span>
      );
    }
    if (status === 'low_stock') {
      return (
        <span className="badge badge-warning flex-row-gap" style={{ padding: '6px 14px', fontSize: '12px' }}>
          <AlertTriangle size={14} /> Low Stock
        </span>
      );
    }
    return (
      <span className="badge badge-success flex-row-gap" style={{ padding: '6px 14px', fontSize: '12px' }}>
        <CheckCircle2 size={14} /> In Stock
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '48px', maxWidth: '850px', margin: '0 auto' }}>
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onClose={() => setToast({ ...toast, visible: false })}
      />

      {/* Header Navigation Banner */}
      <div className="hero-banner flex-between-center" style={{ flexWrap: 'wrap', gap: '16px' }}>
        <div className="flex-row-gap" style={{ gap: '14px' }}>
          <Link href="/inventory" className="btn btn-secondary" style={{ borderRadius: '12px', width: '40px', height: '40px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
            <ArrowLeft size={20} />
          </Link>

          <div className="flex-row-gap" style={{ gap: '12px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'var(--color-primary-lighter)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
              {item.category?.icon || '📦'}
            </div>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-text)', letterSpacing: '-0.5px', margin: 0 }}>
                {item.name}
              </h1>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px', margin: 0 }}>
                {item.category?.name || 'Uncategorized Pantry Item'}
              </p>
            </div>
          </div>
        </div>

        {/* Edit & Delete Action Buttons */}
        <div className="flex-row-gap" style={{ gap: '8px' }}>
          <Link
            href={`/inventory/add?id=${item.id}`}
            className="btn btn-secondary btn-sm"
            style={{ borderRadius: '12px', fontSize: '12px', fontWeight: '700', textDecoration: 'none', padding: '8px 14px' }}
          >
            <Edit size={16} /> Edit
          </Link>
          <button
            onClick={handleDelete}
            className="btn btn-danger btn-sm"
            style={{ borderRadius: '12px', fontSize: '12px', fontWeight: '700', padding: '8px 14px' }}
          >
            <Trash2 size={16} /> Delete
          </button>
        </div>
      </div>

      {/* Main Stock Card */}
      <div className="glass-card" style={{ padding: '28px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Current Stock Level</span>

        <div style={{ fontSize: '48px', fontWeight: '800', color: 'var(--color-primary)', letterSpacing: '-1px', margin: '4px 0' }}>
          {item.currentQuantity} <span style={{ fontSize: '20px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>{item.unit}</span>
        </div>

        {getStatusBadge()}

        <div className="grid-2-cols" style={{ width: '100%', maxWidth: '440px', gap: '12px', marginTop: '12px' }}>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-success hover-lift"
            style={{ borderRadius: '14px', padding: '12px', fontSize: '14px', fontWeight: '800' }}
          >
            <Plus size={18} /> Add Stock
          </button>
          <button
            onClick={() => setShowUseModal(true)}
            className="btn btn-secondary hover-lift"
            style={{ borderRadius: '14px', padding: '12px', fontSize: '14px', fontWeight: '800' }}
          >
            <Minus size={18} /> Use Item
          </button>
        </div>

        {(status === 'low_stock' || status === 'out_of_stock') && (
          <button
            onClick={handleAddToList}
            className="btn btn-primary hover-lift"
            style={{ width: '100%', maxWidth: '440px', borderRadius: '14px', padding: '12px', fontSize: '14px', fontWeight: '800', marginTop: '4px' }}
          >
            <ShoppingCart size={18} /> Add to Shopping List
          </button>
        )}
      </div>

      {/* Details Grid */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-text)', margin: 0, paddingBottom: '12px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Info size={18} color="var(--color-primary)" /> Item Details
        </h3>

        <div className="grid-2-cols" style={{ gap: '16px' }}>
          <div style={{ padding: '12px 16px', borderRadius: '14px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
            <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: '700' }}>Min Quantity Alert</span>
            <p style={{ fontSize: '15px', fontWeight: '800', color: 'var(--color-text)', margin: '2px 0 0 0' }}>{item.minimumQuantity} {item.unit}</p>
          </div>

          <div style={{ padding: '12px 16px', borderRadius: '14px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
            <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: '700' }}>Last Unit Price</span>
            <p style={{ fontSize: '15px', fontWeight: '800', color: 'var(--color-text)', margin: '2px 0 0 0' }}>{item.purchasePrice ? formatCurrency(item.purchasePrice) : '-'}</p>
          </div>

          <div style={{ padding: '12px 16px', borderRadius: '14px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
            <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: '700' }}>Last Purchased</span>
            <p style={{ fontSize: '15px', fontWeight: '800', color: 'var(--color-text)', margin: '2px 0 0 0' }}>{item.lastPurchaseDate ? formatDate(item.lastPurchaseDate) : '-'}</p>
          </div>

          <div style={{ padding: '12px 16px', borderRadius: '14px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
            <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: '700' }}>Expiry Date</span>
            <p style={{ fontSize: '15px', fontWeight: '800', color: 'var(--color-text)', margin: '2px 0 0 0' }}>{item.expiryDate ? formatDate(item.expiryDate) : '-'}</p>
          </div>

          <div style={{ padding: '12px 16px', borderRadius: '14px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', gridColumn: '1 / -1' }}>
            <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: '700' }}>Supplier / Brand</span>
            <p style={{ fontSize: '15px', fontWeight: '800', color: 'var(--color-text)', margin: '2px 0 0 0' }}>{item.supplier || '-'}</p>
          </div>

          {item.notes && (
            <div style={{ padding: '12px 16px', borderRadius: '14px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', gridColumn: '1 / -1' }}>
              <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: '700' }}>Notes</span>
              <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)', margin: '2px 0 0 0' }}>{item.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Price History Chart */}
      {chartData.length >= 2 && (
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-text)', margin: 0, paddingBottom: '12px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} color="var(--color-primary)" /> Price History Trend
          </h3>
          <div style={{ height: '200px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12, fill: '#64748B' }} />
                <Tooltip formatter={(value: any) => formatCurrency(Number(value || 0))} />
                <Line type="monotone" dataKey="price" stroke="#FF6B35" strokeWidth={3} dot={{ r: 5, fill: '#FF6B35' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Transaction History */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-text)', margin: 0, paddingBottom: '12px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <History size={18} color="var(--color-primary)" /> Recent Activity Logs
        </h3>
        {item.transactions && item.transactions.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {item.transactions.slice(0, 10).map((tx: any) => (
              <div key={tx.id} className="flex-between-center" style={{ padding: '12px 16px', borderRadius: '14px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '800' }}>
                    {tx.type === 'purchase' ? (
                      <span style={{ color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}><Plus size={14} /> Bought Stock</span>
                    ) : tx.type === 'consume' ? (
                      <span style={{ color: '#F59E0B', display: 'flex', alignItems: 'center', gap: '4px' }}><Minus size={14} /> Used Stock</span>
                    ) : (
                      <span style={{ color: '#64748B' }}>Stock Adjusted</span>
                    )}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                    {formatDate(tx.date)} {tx.notes ? `• ${tx.notes}` : ''}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: tx.type === 'purchase' ? '#10B981' : tx.type === 'consume' ? '#F59E0B' : '#64748B' }}>
                    {tx.type === 'purchase' ? '+' : tx.type === 'consume' ? '-' : ''}{tx.quantity} {item.unit}
                  </div>
                  {tx.pricePerUnit && <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{formatCurrency(tx.pricePerUnit)} / {item.unit}</div>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '13px', padding: '16px 0' }}>No recent stock activity logged yet.</div>
        )}
      </div>

      {/* Add Stock Modal */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal" style={{ maxWidth: '400px', padding: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--color-text)', margin: 0 }}>Add Stock</h2>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '4px 0 20px 0' }}>Log newly purchased quantity.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="form-label">Quantity ({item.unit}) *</label>
                <input
                  type="number"
                  step="any"
                  value={qty}
                  onChange={e => setQty(e.target.value)}
                  className="form-input"
                  placeholder="e.g., 2"
                />
              </div>
              <div>
                <label className="form-label">Price per Unit (₹) - Optional</label>
                <input
                  type="number"
                  step="any"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  className="form-input"
                  placeholder={item.purchasePrice?.toString()}
                />
              </div>
              <div>
                <label className="form-label">Notes (Optional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="form-input"
                  placeholder="e.g., Purchased from DMart"
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button onClick={() => setShowAddModal(false)} className="btn btn-secondary" style={{ flex: 1, borderRadius: '12px' }}>Cancel</button>
              <button onClick={() => handleTransaction('purchase')} className="btn btn-success" style={{ flex: 1, borderRadius: '12px' }}>Add Stock</button>
            </div>
          </div>
        </div>
      )}

      {/* Use Item Modal */}
      {showUseModal && (
        <div className="modal-backdrop">
          <div className="modal" style={{ maxWidth: '400px', padding: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--color-text)', margin: 0 }}>Use Item</h2>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '4px 0 20px 0' }}>Log quantity consumed in household.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="form-label">Quantity to Remove ({item.unit}) *</label>
                <input
                  type="number"
                  step="any"
                  value={qty}
                  onChange={e => setQty(e.target.value)}
                  className="form-input"
                  placeholder="e.g., 1"
                />
              </div>
              <div>
                <label className="form-label">Notes (Optional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="form-input"
                  placeholder="e.g., Used for cooking"
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button onClick={() => setShowUseModal(false)} className="btn btn-secondary" style={{ flex: 1, borderRadius: '12px' }}>Cancel</button>
              <button onClick={() => handleTransaction('consume')} className="btn btn-primary" style={{ flex: 1, borderRadius: '12px' }}>Use Stock</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
