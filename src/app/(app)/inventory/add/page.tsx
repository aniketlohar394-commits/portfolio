'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Save, Package, Boxes, Tag, DollarSign, Calendar, FileText } from 'lucide-react';
import { UNITS } from '@/lib/utils';
import Link from 'next/link';
import Toast, { ToastType } from '@/components/Toast';

export default function AddInventoryItemPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [toast, setToast] = useState<{ message: string; type: ToastType; visible: boolean }>({
    message: '',
    type: 'info',
    visible: false
  });
  
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    currentQuantity: '1',
    unit: 'kg',
    minimumQuantity: '1',
    purchasePrice: '',
    supplier: '',
    expiryDate: '',
    notes: ''
  });

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type, visible: true });
  };

  useEffect(() => {
    fetchCategories();
    if (id) {
      fetchItem(id);
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories/inventory');
      if (res.ok) {
        const data = await res.json();
        setCategories(data || []);
        if (data.length > 0 && !formData.categoryId) {
          setFormData(prev => ({ ...prev, categoryId: data[0].id }));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchItem = async (itemId: string) => {
    try {
      const res = await fetch(`/api/inventory/${itemId}`);
      if (res.ok) {
        const item = await res.json();
        setFormData({
          name: item.name,
          categoryId: item.categoryId || '',
          currentQuantity: item.currentQuantity ? item.currentQuantity.toString() : '1',
          unit: item.unit || 'kg',
          minimumQuantity: item.minimumQuantity ? item.minimumQuantity.toString() : '1',
          purchasePrice: item.purchasePrice ? item.purchasePrice.toString() : '',
          supplier: item.supplier || '',
          expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : '',
          notes: item.notes || ''
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = id ? `/api/inventory/${id}` : '/api/inventory';
      const method = id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        showToast(id ? 'Updated inventory item!' : 'Added new inventory item!', 'success');
        setTimeout(() => {
          router.push('/inventory');
          router.refresh();
        }, 600);
      } else {
        showToast('Failed to save inventory item.', 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('Error connecting to server.', 'error');
    } finally {
      setLoading(false);
    }
  };

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
          <Link href="/inventory" className="btn btn-secondary" style={{ borderRadius: '12px', width: '40px', height: '40px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
            <ArrowLeft size={20} />
          </Link>

          <div>
            <div className="badge badge-primary" style={{ alignSelf: 'flex-start', padding: '4px 10px', fontSize: '10px', fontWeight: 'bold' }}>
              <Boxes size={12} /> Pantry Manager
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-text)', letterSpacing: '-0.5px', margin: '4px 0 0 0' }}>
              {id ? 'Edit Inventory Item' : 'Add Inventory Item'}
            </h1>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Section 1: Basic Information */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--color-text)', margin: 0, paddingBottom: '8px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Package size={16} color="var(--color-primary)" /> Basic Item Information
          </h3>

          <div>
            <label className="form-label">Item Name *</label>
            <input
              required
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Basmati Rice, Olive Oil, Dish Soap"
              className="form-input"
              style={{ fontSize: '15px', fontWeight: '700' }}
            />
          </div>

          {categories.length > 0 && (
            <div>
              <label className="form-label">Category</label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">Select Category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Section 2: Stock & Quantity Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '8px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--color-text)', margin: 0, paddingBottom: '8px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Boxes size={16} color="var(--color-primary)" /> Stock & Quantity Thresholds
          </h3>

          <div className="grid-2-cols">
            <div>
              <label className="form-label">Current Available Quantity *</label>
              <input
                required
                type="number"
                step="any"
                name="currentQuantity"
                value={formData.currentQuantity}
                onChange={handleChange}
                className="form-input"
                style={{ fontWeight: '800', fontSize: '16px' }}
              />
            </div>
            <div>
              <label className="form-label">Unit of Measurement</label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="form-select"
              >
                {UNITS.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid-2-cols">
            <div>
              <label className="form-label">Minimum Stock Alert Threshold</label>
              <input
                type="number"
                step="any"
                name="minimumQuantity"
                value={formData.minimumQuantity}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Purchase Price per Unit (₹)</label>
              <input
                type="number"
                step="any"
                name="purchasePrice"
                value={formData.purchasePrice}
                onChange={handleChange}
                placeholder="0.00"
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Supplier & Expiry */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '8px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--color-text)', margin: 0, paddingBottom: '8px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={16} color="var(--color-primary)" /> Supplier & Expiry (Optional)
          </h3>

          <div className="grid-2-cols">
            <div>
              <label className="form-label">Supplier / Store Brand</label>
              <input
                type="text"
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
                placeholder="e.g., DMart, BigBasket, Local Vendor"
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">Expiry Date</label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>

          <div>
            <label className="form-label">Notes & Description</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Add any specific storage instructions or notes..."
              className="form-input"
              style={{ borderRadius: '14px' }}
            ></textarea>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary hover-lift"
          style={{ width: '100%', borderRadius: '14px', fontSize: '15px', fontWeight: '800', padding: '14px', marginTop: '12px' }}
        >
          <Save size={18} />
          <span>{loading ? 'Saving Item...' : 'Save Inventory Item'}</span>
        </button>
      </form>
    </div>
  );
}
