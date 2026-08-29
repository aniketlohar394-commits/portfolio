'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Search, Package, AlertTriangle, AlertOctagon, CheckCircle2, ArrowUpRight, Boxes } from 'lucide-react';
import { formatCurrency, getStockStatus } from '@/lib/utils';

export default function InventoryPage() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all, low, out
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchItems();
  }, [search, filter, selectedCategory]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/inventory?category=all');
      if (res.ok) {
        const data = await res.json();
        const cats = new Map();
        data.forEach((item: any) => {
          if (item.category) {
            cats.set(item.categoryId, item.category);
          }
        });
        setCategories(Array.from(cats.values()));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (filter !== 'all') query.append('stockStatus', filter);
      if (selectedCategory !== 'all') query.append('category', selectedCategory);

      const res = await fetch(`/api/inventory?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (item: any) => {
    const status = getStockStatus(item.currentQuantity, item.minimumQuantity);
    if (status === 'out_of_stock') {
      return (
        <span className="badge badge-danger flex-row-gap" style={{ fontSize: '11px', padding: '4px 10px' }}>
          <AlertOctagon size={12} /> Out of Stock
        </span>
      );
    }
    if (status === 'low_stock') {
      return (
        <span className="badge badge-warning flex-row-gap" style={{ fontSize: '11px', padding: '4px 10px' }}>
          <AlertTriangle size={12} /> Low Stock
        </span>
      );
    }
    return (
      <span className="badge badge-success flex-row-gap" style={{ fontSize: '11px', padding: '4px 10px' }}>
        <CheckCircle2 size={12} /> In Stock
      </span>
    );
  };

  const lowStockCount = items.filter(i => getStockStatus(i.currentQuantity, i.minimumQuantity) === 'low_stock').length;
  const outOfStockCount = items.filter(i => getStockStatus(i.currentQuantity, i.minimumQuantity) === 'out_of_stock').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '48px', maxWidth: '1150px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div className="hero-banner flex-between-center" style={{ flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div className="badge badge-primary" style={{ alignSelf: 'flex-start', padding: '6px 12px', fontSize: '11px', fontWeight: 'bold' }}>
            <Boxes size={13} /> Pantry Stock Manager
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--color-text)', letterSpacing: '-0.5px', margin: 0 }}>
            Household Inventory
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: 0 }}>
            Track pantry stock levels, minimum reorder thresholds, and price history logs.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '10px 18px', borderRadius: '16px', background: '#FFFFFF', border: '1px solid #E2E8F0', textAlign: 'right' }}>
            <p style={{ fontSize: '10px', fontWeight: '800', color: 'var(--color-text-secondary)', textTransform: 'uppercase', margin: 0 }}>Total Tracked</p>
            <p style={{ fontSize: '22px', fontWeight: '800', color: 'var(--color-primary)', margin: 0 }}>{items.length} items</p>
          </div>

          <Link 
            href="/inventory/add" 
            className="btn btn-primary hover-lift"
            style={{ borderRadius: '14px', fontSize: '13px', fontWeight: '700', padding: '12px 20px', textDecoration: 'none' }}
          >
            <Plus size={18} />
            <span>Add Item</span>
          </Link>
        </div>
      </div>

      {/* Summary Metrics Bar */}
      <div className="grid-3-layout" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <div className="stat-card-widget">
          <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Total Tracked</span>
          <p style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-text)', margin: '4px 0 0 0' }}>{items.length} items</p>
        </div>

        <div className="stat-card-widget">
          <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Low Stock Alerts</span>
          <p style={{ fontSize: '24px', fontWeight: '800', color: '#F59E0B', margin: '4px 0 0 0' }}>{lowStockCount} items</p>
        </div>

        <div className="stat-card-widget">
          <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Out of Stock</span>
          <p style={{ fontSize: '24px', fontWeight: '800', color: '#EF4444', margin: '4px 0 0 0' }}>{outOfStockCount} items</p>
        </div>
      </div>

      {/* Search & Stock Filter Bar */}
      <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={18} color="var(--color-text-secondary)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search inventory items by name, unit, or category..."
            className="form-input"
            style={{ paddingLeft: '44px', background: 'var(--color-bg)', borderRadius: '14px' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filter Pills */}
        <div className="flex-between-center" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <div className="flex-row-gap" style={{ flexWrap: 'wrap', gap: '8px' }}>
            <button
              onClick={() => setFilter('all')}
              className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: '12px', fontSize: '12px', fontWeight: '700', padding: '6px 14px' }}
            >
              All Items
            </button>
            <button
              onClick={() => setFilter('low')}
              className={`btn btn-sm ${filter === 'low' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: '12px', fontSize: '12px', fontWeight: '700', padding: '6px 14px' }}
            >
              <AlertTriangle size={14} /> Low Stock
            </button>
            <button
              onClick={() => setFilter('out')}
              className={`btn btn-sm ${filter === 'out' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: '12px', fontSize: '12px', fontWeight: '700', padding: '6px 14px' }}
            >
              <AlertOctagon size={14} /> Out of Stock
            </button>
          </div>

          {/* Categories Filter */}
          {categories.length > 0 && (
            <div className="flex-row-gap" style={{ gap: '6px' }}>
              <select 
                value={selectedCategory} 
                onChange={e => setSelectedCategory(e.target.value)}
                className="form-select"
                style={{ fontSize: '12px', padding: '6px 32px 6px 12px', height: 'auto', minHeight: '0', borderRadius: '12px' }}
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Inventory Grid */}
      {loading ? (
        <div className="grid-2-cols">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton" style={{ height: '140px', borderRadius: '20px' }}></div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '48px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255, 107, 53, 0.1)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>
            📦
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-text)', margin: 0 }}>No Inventory Items</h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px', maxWidth: '380px' }}>
              No stock records found matching your active filter. Add pantry items to start tracking quantities.
            </p>
          </div>
          <Link href="/inventory/add" className="btn btn-primary hover-lift" style={{ borderRadius: '14px', fontSize: '13px', fontWeight: '700', padding: '10px 20px', textDecoration: 'none' }}>
            <Plus size={16} /> Add Inventory Item
          </Link>
        </div>
      ) : (
        <div className="grid-2-cols">
          {items.map((item) => (
            <Link href={`/inventory/${item.id}`} key={item.id} style={{ textDecoration: 'none' }}>
              <div className="glass-card hover-lift" style={{ padding: '20px', borderRadius: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', transition: 'all 200ms ease' }}>
                <div className="flex-between-center" style={{ alignItems: 'flex-start' }}>
                  <div className="flex-row-gap" style={{ gap: '12px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'var(--color-primary-lighter)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '22px', flexShrink: 0 }}>
                      {item.category?.icon || '📦'}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-text)', margin: 0 }}>
                        {item.name}
                      </h3>
                      <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '2px 0 0 0' }}>
                        {item.category?.name || 'Uncategorized'}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(item)}
                </div>
                
                <div className="flex-between-center" style={{ marginTop: '20px', paddingTop: '14px', borderTop: '1px solid var(--color-border)' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>Available Stock</span>
                    <p style={{ fontSize: '20px', fontWeight: '800', color: 'var(--color-primary)', margin: '2px 0 0 0' }}>
                      {item.currentQuantity} <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--color-text-secondary)' }}>{item.unit || 'units'}</span>
                    </p>
                  </div>

                  {item.purchasePrice ? (
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>Last Unit Price</span>
                      <p style={{ fontSize: '14px', fontWeight: '800', color: 'var(--color-text)', margin: '2px 0 0 0' }}>
                        {formatCurrency(item.purchasePrice)}
                      </p>
                    </div>
                  ) : (
                    <span style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '2px' }}>
                      Details <ArrowUpRight size={14} />
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
