'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Plus, Check, Edit2, AlertCircle, X } from 'lucide-react';
import Link from 'next/link';
import Toast, { ToastType } from '@/components/Toast';

interface Vendor {
  id: string;
  name: string;
  pricePerLitre: number;
  defaultQuantity: number;
  isActive: boolean;
}

export default function MilkSettingsPage() {
  const router = useRouter();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType; visible: boolean }>({
    message: '',
    type: 'info',
    visible: false
  });

  // Form state
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [qty, setQty] = useState('');

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type, visible: true });
  };

  const fetchVendors = async () => {
    setErrorMessage(null);
    try {
      const res = await fetch('/api/milk/vendors');
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const msg = errData.error || 'Failed to fetch vendors';
        setErrorMessage(msg);
        showToast(msg, 'error');
        return;
      }
      const data = await res.json();
      setVendors(data || []);
    } catch (e: any) {
      console.error(e);
      const msg = e?.message || 'Error loading vendors';
      setErrorMessage(msg);
      showToast(msg, 'error');
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleSave = async () => {
    if (!name.trim()) {
      showToast('Please enter vendor name', 'warning');
      return;
    }
    if (!price || Number(price) <= 0) {
      showToast('Please enter a valid price per litre', 'warning');
      return;
    }
    if (!qty || Number(qty) <= 0) {
      showToast('Please enter a valid default quantity', 'warning');
      return;
    }

    setErrorMessage(null);
    try {
      const method = editingId ? 'PUT' : 'POST';
      const body: any = {
        name,
        pricePerLitre: Number(price),
        defaultQuantity: Number(qty),
        isActive: vendors.length === 0 ? true : editingId ? vendors.find(v => v.id === editingId)?.isActive : false
      };
      if (editingId) body.id = editingId;

      const res = await fetch('/api/milk/vendors', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = data.error || 'Failed to save vendor details';
        setErrorMessage(msg);
        showToast(msg, 'error');
        return;
      }

      showToast(editingId ? 'Vendor updated successfully!' : 'Vendor added successfully!', 'success');
      setIsAdding(false);
      setEditingId(null);
      setName('');
      setPrice('');
      setQty('');
      fetchVendors();
    } catch (e: any) {
      console.error(e);
      const msg = e?.message || 'Error saving vendor';
      setErrorMessage(msg);
      showToast(msg, 'error');
    }
  };

  const handleSetActive = async (id: string) => {
    setErrorMessage(null);
    try {
      for (const vendor of vendors) {
        if (vendor.isActive && vendor.id !== id) {
          await fetch('/api/milk/vendors', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...vendor, isActive: false })
          });
        }
      }
      const vendorToActivate = vendors.find(v => v.id === id);
      if (vendorToActivate) {
        const res = await fetch('/api/milk/vendors', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...vendorToActivate, isActive: true })
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to activate vendor');
        }
      }
      showToast('Active vendor updated!', 'success');
      fetchVendors();
    } catch (e: any) {
      console.error(e);
      const msg = e?.message || 'Error changing active vendor';
      setErrorMessage(msg);
      showToast(msg, 'error');
    }
  };

  return (
    <div className="page-container" style={{ padding: '16px', paddingBottom: '80px', maxWidth: '800px', margin: '0 auto' }}>
      <Toast 
        message={toast.message} 
        type={toast.type} 
        visible={toast.visible} 
        onClose={() => setToast({ ...toast, visible: false })} 
      />

      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px', gap: '16px' }}>
        <Link href="/milk" className="btn-icon" style={{ padding: '8px', background: 'var(--color-surface)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ChevronLeft size={24} color="var(--color-text)" />
        </Link>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Milk Settings</h1>
      </div>

      {errorMessage && (
        <div style={{ padding: '12px 16px', borderLeft: '4px solid #EF4444', background: 'rgba(239, 68, 68, 0.1)', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '12px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={18} color="#DC2626" />
            <span style={{ fontSize: '13px', fontWeight: '600' }}>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', padding: '4px' }}>
            <X size={16} />
          </button>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>Vendors</h2>
        {!isAdding && !editingId && (
          <button onClick={() => setIsAdding(true)} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--color-primary)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 'var(--radius-md)', fontWeight: 'bold', cursor: 'pointer' }}>
            <Plus size={16} /> Add Vendor
          </button>
        )}
      </div>

      {(isAdding || editingId) && (
        <div style={{ background: 'var(--color-surface)', padding: '16px', borderRadius: 'var(--radius-lg)', marginBottom: '24px', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 'bold' }}>
            {editingId ? 'Edit Vendor' : 'New Vendor'}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input placeholder="Vendor Name" value={name} onChange={e => setName(e.target.value)} style={{ padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', width: '100%' }} />
            <div style={{ display: 'flex', gap: '12px' }}>
              <input type="number" placeholder="Price/L (₹)" value={price} onChange={e => setPrice(e.target.value)} style={{ padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', flex: 1 }} />
              <input type="number" placeholder="Qty (L)" value={qty} onChange={e => setQty(e.target.value)} style={{ padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', flex: 1 }} />
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button onClick={() => { setIsAdding(false); setEditingId(null); }} style={{ flex: 1, padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'transparent', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSave} style={{ flex: 1, padding: '12px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--color-primary)', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Save</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {vendors.map(vendor => (
          <div key={vendor.id} style={{ background: 'var(--color-surface)', padding: '16px', borderRadius: 'var(--radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow-sm)', border: vendor.isActive ? '2px solid var(--color-primary)' : '1px solid transparent' }}>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {vendor.name} 
                {vendor.isActive && <span style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary-dark)', fontSize: '10px', padding: '2px 6px', borderRadius: '10px', textTransform: 'uppercase' }}>Active</span>}
              </div>
              <div style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginTop: '4px' }}>
                ₹{vendor.pricePerLitre}/L • Default {vendor.defaultQuantity}L
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {!vendor.isActive && (
                <button onClick={() => handleSetActive(vendor.id)} title="Set as active vendor" style={{ padding: '8px', borderRadius: '50%', background: 'var(--color-bg)', border: 'none', color: 'var(--color-secondary)', cursor: 'pointer' }}>
                  <Check size={20} />
                </button>
              )}
              <button onClick={() => {
                setEditingId(vendor.id);
                setName(vendor.name);
                setPrice(String(vendor.pricePerLitre));
                setQty(String(vendor.defaultQuantity));
                setIsAdding(false);
              }} title="Edit vendor" style={{ padding: '8px', borderRadius: '50%', background: 'var(--color-bg)', border: 'none', color: 'var(--color-info)', cursor: 'pointer' }}>
                <Edit2 size={20} />
              </button>
            </div>
          </div>
        ))}
        {vendors.length === 0 && !isAdding && (
          <div style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-secondary)' }}>
            No vendors added yet. Add one to start tracking milk.
          </div>
        )}
      </div>
    </div>
  );
}
