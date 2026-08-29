'use client';

import { useState, useEffect } from 'react';
import { Plus, Check, ShoppingBag, Trash2, Package, Sparkles, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import Toast, { ToastType } from '@/components/Toast';

export default function ShoppingListPage() {
  const [items, setItems] = useState<any[]>([]);
  const [inventorySuggestions, setInventorySuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: ToastType; visible: boolean }>({
    message: '',
    type: 'info',
    visible: false
  });
  
  // Add item form
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState('');

  // Purchase modal
  const [purchasingItem, setPurchasingItem] = useState<any>(null);
  const [actualPrice, setActualPrice] = useState('');
  const [actualQty, setActualQty] = useState('');

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type, visible: true });
  };

  useEffect(() => {
    fetchShoppingItems();
    fetchLowInventory();
  }, []);

  const fetchShoppingItems = async () => {
    try {
      const res = await fetch('/api/shopping');
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchLowInventory = async () => {
    try {
      const res = await fetch('/api/inventory?stockStatus=low');
      const res2 = await fetch('/api/inventory?stockStatus=out');
      if (res.ok && res2.ok) {
        const data1 = await res.json();
        const data2 = await res2.json();
        setInventorySuggestions([...data2, ...data1].slice(0, 5));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddItem = async (e: React.FormEvent, inventoryItemId?: string, defaultName?: string, unit?: string) => {
    if (e) e.preventDefault();
    const itemName = defaultName || name;
    if (!itemName) return;

    try {
      const res = await fetch('/api/shopping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: itemName,
          quantity: quantity || undefined,
          estimatedPrice: estimatedPrice || undefined,
          inventoryItemId
        }),
      });
      if (res.ok) {
        showToast(`Added "${itemName}" to your shopping list!`, 'success');
        setName('');
        setQuantity('');
        setEstimatedPrice('');
        fetchShoppingItems();
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to add item.', 'error');
    }
  };

  const handlePurchase = async () => {
    if (!purchasingItem || !actualPrice) return;
    
    try {
      const res = await fetch(`/api/shopping/${purchasingItem.id}/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actualPrice: parseFloat(actualPrice),
          actualQuantity: actualQty ? parseFloat(actualQty) : undefined,
        }),
      });

      if (res.ok) {
        showToast(`Purchased "${purchasingItem.name}" for ₹${actualPrice}!`, 'success');
        setPurchasingItem(null);
        setActualPrice('');
        setActualQty('');
        fetchShoppingItems();
      } else {
        showToast('Failed to mark item as purchased', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error purchasing item.', 'error');
    }
  };

  const handleDelete = async (id: string, itemName: string) => {
    if (!confirm(`Remove "${itemName}" from shopping list?`)) return;
    try {
      await fetch(`/api/shopping/${id}`, { method: 'DELETE' });
      showToast(`Removed "${itemName}".`, 'info');
      fetchShoppingItems();
    } catch (err) {
      console.error(err);
    }
  };

  const pendingItems = items.filter(i => !i.isPurchased);
  const purchasedItems = items.filter(i => i.isPurchased);
  const estimatedTotal = pendingItems.reduce((sum, item) => sum + (item.estimatedPrice || 0), 0);

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
            <ShoppingBag size={13} /> Household Supplies
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--color-text)', letterSpacing: '-0.5px', margin: 0 }}>
            Shopping List
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: 0 }}>
            Organize grocery trips, track estimated costs, and sync purchased items to pantry inventory.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '10px 18px', borderRadius: '16px', background: '#FFFFFF', border: '1px solid #E2E8F0', textAlign: 'right' }}>
            <p style={{ fontSize: '10px', fontWeight: '800', color: 'var(--color-text-secondary)', textTransform: 'uppercase', margin: 0 }}>Items Pending</p>
            <p style={{ fontSize: '22px', fontWeight: '800', color: 'var(--color-primary)', margin: 0 }}>{pendingItems.length} to buy</p>
          </div>
        </div>
      </div>

      {/* Estimated Basket Total Banner */}
      {estimatedTotal > 0 && (
        <div className="glass-card flex-between-center" style={{ padding: '20px 24px', background: 'linear-gradient(135deg, #FFF0EB 0%, #F0FDF4 100%)', border: '1px solid #FFE4D9' }}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-primary)', textTransform: 'uppercase', margin: 0 }}>Estimated Basket Cost</p>
            <p style={{ fontSize: '28px', fontWeight: '800', color: 'var(--color-text)', margin: '2px 0 0 0' }}>{formatCurrency(estimatedTotal)}</p>
          </div>
          <span className="badge badge-primary" style={{ fontSize: '12px', padding: '6px 14px', fontWeight: '700' }}>
            {pendingItems.length} items to buy
          </span>
        </div>
      )}

      {/* Add Item Form (Clean side-by-side horizontal row layout) */}
      <form onSubmit={handleAddItem} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--color-text)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} color="var(--color-primary)" /> Quick Add Supply Item
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '12px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Item name (e.g., Organic Milk, Bread, Soap)"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="form-input"
            style={{ borderRadius: '14px', background: 'var(--color-bg)' }}
          />

          <input
            type="text"
            placeholder="Qty / Pack"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
            className="form-input"
            style={{ borderRadius: '14px', background: 'var(--color-bg)' }}
          />

          <input
            type="number"
            placeholder="Est. ₹ Price"
            value={estimatedPrice}
            onChange={e => setEstimatedPrice(e.target.value)}
            className="form-input"
            style={{ borderRadius: '14px', background: 'var(--color-bg)' }}
          />

          <button 
            type="submit" 
            className="btn btn-primary hover-lift"
            style={{ borderRadius: '14px', fontSize: '13px', fontWeight: '700', padding: '12px 20px', whiteSpace: 'nowrap' }}
          >
            <Plus size={18} />
            <span>Add Item</span>
          </button>
        </div>
      </form>

      {/* Inventory Replenishment Suggestions */}
      {inventorySuggestions.length > 0 && (
        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-text-secondary)', textTransform: 'uppercase', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={14} color="var(--color-warning)" /> Low Stock Pantry Recommendations
          </h3>
          <div style={{ display: 'flex', overflowX: 'auto', gap: '12px', paddingBottom: '4px' }}>
            {inventorySuggestions.map(item => (
              <div key={item.id} style={{ minWidth: '190px', padding: '14px', borderRadius: '16px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '10px' }}>
                <div>
                  <p style={{ fontWeight: '800', color: 'var(--color-text)', fontSize: '14px', margin: 0 }}>{item.name}</p>
                  <p style={{ fontSize: '11px', color: 'var(--color-danger)', fontWeight: '600', marginTop: '2px', margin: 0 }}>
                    Stock: {item.currentQuantity} {item.unit || 'units'} left
                  </p>
                </div>
                <button
                  onClick={(e) => handleAddItem(e, item.id, item.name, item.unit)}
                  className="btn btn-sm btn-primary"
                  style={{ borderRadius: '10px', fontSize: '11px', width: '100%' }}
                >
                  + Add to List
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Items to Buy List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-text-secondary)', textTransform: 'uppercase', margin: 0 }}>
          Items To Buy ({pendingItems.length})
        </h3>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '64px', borderRadius: '16px' }}></div>)}
          </div>
        ) : pendingItems.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '48px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
              📦
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-text)', margin: 0 }}>Shopping List is Clear!</h3>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>All required household supplies have been bought.</p>
            </div>
          </div>
        ) : (
          pendingItems.map(item => (
            <div 
              key={item.id} 
              className="glass-card flex-between-center hover-lift"
              style={{ padding: '16px 20px', borderRadius: '18px', transition: 'all 200ms ease' }}
            >
              <div className="flex-row-gap" style={{ gap: '14px', flex: 1, minWidth: 0 }}>
                <button 
                  onClick={() => {
                    setPurchasingItem(item);
                    setActualPrice(item.estimatedPrice?.toString() || '');
                    setActualQty(item.quantity?.toString() || '1');
                  }}
                  style={{ width: '38px', height: '38px', borderRadius: '50%', border: '2px solid #E2E8F0', background: '#FFFFFF', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 150ms ease', flexShrink: 0 }}
                  title="Mark as Purchased"
                >
                  <Check size={18} />
                </button>

                <div style={{ overflow: 'hidden' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--color-text)', margin: 0 }}>{item.name}</h4>
                  <div className="flex-row-gap" style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px', gap: '8px' }}>
                    {item.quantity && <span>Qty: {item.quantity}</span>}
                    {item.estimatedPrice && (
                      <span className="badge badge-primary" style={{ fontSize: '10px' }}>
                        Est. {formatCurrency(item.estimatedPrice)}
                      </span>
                    )}
                    {item.inventoryItemId && (
                      <span className="badge badge-success" style={{ fontSize: '10px' }}>
                        Syncs to Stock
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => handleDelete(item.id, item.name)} 
                style={{ padding: '8px', border: 'none', background: 'none', color: '#94A3B8', cursor: 'pointer', borderRadius: '10px' }}
                title="Remove item"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Recently Purchased History */}
      {purchasedItems.length > 0 && (
        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-text-secondary)', textTransform: 'uppercase', margin: 0 }}>
            Recently Purchased Supplies ({purchasedItems.length})
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {purchasedItems.slice(0, 10).map(item => (
              <div key={item.id} className="flex-between-center" style={{ padding: '10px 14px', borderRadius: '12px', background: 'var(--color-bg-secondary)', opacity: 0.8 }}>
                <div className="flex-row-gap" style={{ gap: '10px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>
                    <Check size={14} />
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)', textDecoration: 'line-through' }}>{item.name}</span>
                </div>
                <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--color-text)' }}>
                  {formatCurrency(item.actualPrice || 0)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Purchase Dialog Modal */}
      {purchasingItem && (
        <div className="modal-backdrop">
          <div className="modal" style={{ maxWidth: '440px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--color-text)', margin: 0 }}>Confirm Purchase</h2>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '4px 0 20px 0' }}>
              Enter final purchase price paid for <strong style={{ color: 'var(--color-text)' }}>{purchasingItem.name}</strong>
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="form-label">Total Price Paid (₹) *</label>
                <input 
                  type="number" 
                  step="any" 
                  value={actualPrice} 
                  onChange={e => setActualPrice(e.target.value)} 
                  className="form-input"
                  style={{ fontSize: '18px', fontWeight: '800' }} 
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="form-label">Quantity Bought</label>
                <input 
                  type="number" 
                  step="any" 
                  value={actualQty} 
                  onChange={e => setActualQty(e.target.value)} 
                  className="form-input" 
                  placeholder="1"
                />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button 
                onClick={() => setPurchasingItem(null)} 
                className="btn btn-secondary"
                style={{ flex: 1, borderRadius: '12px' }}
              >
                Cancel
              </button>
              <button 
                onClick={handlePurchase} 
                disabled={!actualPrice}
                className="btn btn-primary"
                style={{ flex: 1, borderRadius: '12px' }}
              >
                Save Purchase
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
