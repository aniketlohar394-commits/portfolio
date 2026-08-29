'use client';

import { useState, useEffect } from 'react';
import { Download, Upload, Trash2, LogOut, Database, User as UserIcon, Plus, Palette, Settings, Wallet, Tag } from 'lucide-react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [expenseCategories, setExpenseCategories] = useState<any[]>([]);
  const [inventoryCategories, setInventoryCategories] = useState<any[]>([]);
  
  // New Category States
  const [newExpenseCategory, setNewExpenseCategory] = useState('');
  const [newInventoryCategory, setNewInventoryCategory] = useState('');

  useEffect(() => {
    fetch('/api/settings').then(res => res.json()).then(data => {
      setSettings(data);
      if (data.theme) document.documentElement.setAttribute('data-theme', data.theme);
    });
    fetchCategories();
  }, []);

  const fetchCategories = () => {
    fetch('/api/categories').then(res => res.json()).then(data => setExpenseCategories(data));
    fetch('/api/categories/inventory').then(res => res.json()).then(data => setInventoryCategories(data));
  };

  const updateSetting = async (key: string, value: any) => {
    setSettings({ ...settings, [key]: value });
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [key]: value })
    });
    if (key === 'theme') {
      document.documentElement.setAttribute('data-theme', value);
      localStorage.setItem('homemate-theme', value);
    }
  };

  const handleAddExpenseCategory = async () => {
    if (!newExpenseCategory) return;
    await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newExpenseCategory })
    });
    setNewExpenseCategory('');
    fetchCategories();
  };

  const handleDeleteExpenseCategory = async (id: string) => {
    await fetch('/api/categories', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    fetchCategories();
  };

  const handleAddInventoryCategory = async () => {
    if (!newInventoryCategory) return;
    await fetch('/api/categories/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newInventoryCategory })
    });
    setNewInventoryCategory('');
    fetchCategories();
  };

  const handleDeleteInventoryCategory = async (id: string) => {
    await fetch('/api/categories/inventory', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    fetchCategories();
  };

  const handleSampleData = async () => {
    if (confirm('Load sample household data?')) {
      await fetch('/api/data/sample', { method: 'POST' });
      alert('Sample data loaded successfully!');
      window.location.reload();
    }
  };

  const handleResetData = async () => {
    if (confirm('WARNING! This will delete ALL your data. Are you sure?')) {
      await fetch('/api/data/reset', { method: 'POST' });
      alert('All data reset!');
      window.location.reload();
    }
  };

  if (!settings) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '16px' }}>
        <div className="skeleton" style={{ height: '100px', borderRadius: '24px' }}></div>
        <div className="skeleton" style={{ height: '160px', borderRadius: '20px' }}></div>
        <div className="skeleton" style={{ height: '160px', borderRadius: '20px' }}></div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '48px', maxWidth: '1150px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div className="hero-banner flex-between-center" style={{ flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div className="badge badge-primary" style={{ alignSelf: 'flex-start', padding: '6px 12px', fontSize: '11px', fontWeight: 'bold' }}>
            <Settings size={13} /> Household Control Center
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--color-text)', letterSpacing: '-0.5px', margin: 0 }}>
            Settings & Preferences
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: 0 }}>
            Manage application themes, user profile, monthly budget targets, and household backups.
          </p>
        </div>
      </div>

      {/* User Profile */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-text)', margin: 0, paddingBottom: '12px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UserIcon size={18} color="var(--color-primary)" /> Profile Details
        </h2>
        
        <div className="grid-2-cols">
          <div>
            <label className="form-label">Full Name</label>
            <input 
              value={settings.user?.name || 'Household Admin'} 
              className="form-input bg-bg-secondary"
              style={{ fontWeight: '700' }}
              readOnly
            />
          </div>
          <div>
            <label className="form-label">Email Address</label>
            <input 
              value={settings.user?.email || 'admin@homemate.app'} 
              className="form-input bg-bg-secondary"
              style={{ color: 'var(--color-text-secondary)' }}
              readOnly
            />
          </div>
        </div>
      </div>

      {/* Appearance & Theme Switcher */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-text)', margin: 0, paddingBottom: '12px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Palette size={18} color="var(--color-primary)" /> Appearance & Theme Switcher
        </h2>

        <div className="flex-between-center" style={{ padding: '16px 20px', borderRadius: '16px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
          <div>
            <p style={{ fontSize: '14px', fontWeight: '800', color: 'var(--color-text)', margin: 0 }}>Application Theme</p>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px', margin: 0 }}>Toggle between Light and Dark mode appearance</p>
          </div>

          <ThemeToggle />
        </div>

        <div className="grid-2-cols" style={{ paddingTop: '8px' }}>
          <div className="flex-between-center" style={{ padding: '14px 18px', borderRadius: '14px', background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-text-secondary)' }}>Default Currency</span>
            <span className="badge badge-primary font-bold">₹ INR</span>
          </div>

          <div className="flex-between-center" style={{ padding: '14px 18px', borderRadius: '14px', background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-text-secondary)' }}>Language</span>
            <select 
              value={settings.language || 'en'} 
              onChange={e => updateSetting('language', e.target.value)}
              className="form-select"
              style={{ fontSize: '12px', padding: '4px 28px 4px 10px', height: 'auto', minHeight: '0', borderRadius: '10px' }}
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="mr">Marathi</option>
            </select>
          </div>
        </div>
      </div>

      {/* Monthly Budget Target Settings */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="flex-between-center" style={{ paddingBottom: '12px', borderBottom: '1px solid var(--color-border)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-text)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wallet size={18} color="var(--color-primary)" /> Monthly Budget Target
          </h2>
          <Link href="/budget" style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: '700', textDecoration: 'none' }}>
            Budget Management →
          </Link>
        </div>
        
        <div className="flex-row-gap" style={{ gap: '12px' }}>
          <span style={{ fontSize: '22px', fontWeight: '800', color: 'var(--color-text)' }}>₹</span>
          <input 
            type="number" 
            value={settings.monthlyBudget || 20000} 
            onChange={e => updateSetting('monthlyBudget', Number(e.target.value))} 
            className="form-input"
            style={{ maxWidth: '240px', fontWeight: '800', fontSize: '18px' }} 
          />
        </div>
      </div>

      {/* Categories */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-text)', margin: 0, paddingBottom: '12px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Tag size={18} color="var(--color-primary)" /> Manage Household Categories
        </h2>
        
        {/* Expense Categories */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-text-secondary)', textTransform: 'uppercase', margin: 0 }}>Expense Categories</h3>
          
          <div className="grid-4-cols" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {expenseCategories.map(c => (
              <div key={c.id} className="flex-between-center" style={{ padding: '10px 14px', borderRadius: '14px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', fontSize: '12px', fontWeight: '700', color: 'var(--color-text)' }}>
                <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{c.icon} {c.name}</span>
                {!c.isDefault && (
                  <button onClick={() => handleDeleteExpenseCategory(c.id)} style={{ border: 'none', background: 'none', color: '#EF4444', cursor: 'pointer', padding: '2px' }}>
                    <Trash2 size={14}/>
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex-row-gap" style={{ gap: '10px', paddingTop: '4px' }}>
            <input 
              value={newExpenseCategory} 
              onChange={e => setNewExpenseCategory(e.target.value)} 
              placeholder="New expense category name" 
              className="form-input"
              style={{ fontSize: '12px', flex: 1, borderRadius: '12px' }} 
            />
            <button onClick={handleAddExpenseCategory} className="btn btn-primary btn-sm" style={{ borderRadius: '12px', fontSize: '12px', fontWeight: '700' }}>
              <Plus size={14}/> Add
            </button>
          </div>
        </div>

        {/* Inventory Categories */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
          <h3 style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-text-secondary)', textTransform: 'uppercase', margin: 0 }}>Inventory Categories</h3>
          
          <div className="grid-4-cols" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {inventoryCategories.map(c => (
              <div key={c.id} className="flex-between-center" style={{ padding: '10px 14px', borderRadius: '14px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', fontSize: '12px', fontWeight: '700', color: 'var(--color-text)' }}>
                <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{c.icon} {c.name}</span>
                {!c.isDefault && (
                  <button onClick={() => handleDeleteInventoryCategory(c.id)} style={{ border: 'none', background: 'none', color: '#EF4444', cursor: 'pointer', padding: '2px' }}>
                    <Trash2 size={14}/>
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex-row-gap" style={{ gap: '10px', paddingTop: '4px' }}>
            <input 
              value={newInventoryCategory} 
              onChange={e => setNewInventoryCategory(e.target.value)} 
              placeholder="New inventory category name" 
              className="form-input"
              style={{ fontSize: '12px', flex: 1, borderRadius: '12px' }} 
            />
            <button onClick={handleAddInventoryCategory} className="btn btn-primary btn-sm" style={{ borderRadius: '12px', fontSize: '12px', fontWeight: '700' }}>
              <Plus size={14}/> Add
            </button>
          </div>
        </div>
      </div>

      {/* Household Data Actions */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-text)', margin: 0, paddingBottom: '12px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Database size={18} color="var(--color-primary)"/> Household Data Actions
        </h2>

        <div className="grid-2-cols" style={{ gap: '12px' }}>
          <button onClick={handleSampleData} className="btn btn-secondary hover-lift" style={{ borderRadius: '14px', fontSize: '12px', fontWeight: '700', padding: '12px 16px', justifyContent: 'flex-start' }}>
            Load Demo Sample Data
          </button>
          
          <a href="/api/data/export" className="btn btn-secondary hover-lift flex-between-center" style={{ borderRadius: '14px', fontSize: '12px', fontWeight: '700', padding: '12px 16px', textDecoration: 'none' }} download>
            <span>Export JSON Backup</span> <Download size={16}/>
          </a>
          
          <a href="/api/data/export?format=csv" className="btn btn-secondary hover-lift flex-between-center" style={{ borderRadius: '14px', fontSize: '12px', fontWeight: '700', padding: '12px 16px', textDecoration: 'none' }} download>
            <span>Export CSV File</span> <Download size={16}/>
          </a>

          <div className="btn btn-secondary hover-lift flex-between-center" style={{ position: 'relative', borderRadius: '14px', fontSize: '12px', fontWeight: '700', padding: '12px 16px' }}>
            <span>Import Data File</span> <Upload size={16}/>
            <input 
              type="file" 
              accept=".json" 
              style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} 
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = async (event) => {
                  try {
                    const data = JSON.parse(event.target?.result as string);
                    await fetch('/api/data/import', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(data)
                    });
                    alert('Data imported successfully!');
                    window.location.reload();
                  } catch (err) {
                    alert('Invalid JSON file format');
                  }
                };
                reader.readAsText(file);
              }} 
            />
          </div>
        </div>

        <button onClick={handleResetData} className="btn btn-danger hover-lift flex-between-center" style={{ borderRadius: '14px', fontSize: '12px', fontWeight: '700', padding: '12px 20px', marginTop: '8px' }}>
          <span>Reset All Household Data</span>
          <Trash2 size={16}/>
        </button>
      </div>

      {/* Session & Account */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', borderColor: '#FECDD3' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#E11D48', margin: 0, paddingBottom: '12px', borderBottom: '1px solid var(--color-border)' }}>Session & Account</h2>
        <button onClick={() => signOut({ callbackUrl: '/' })} className="btn btn-secondary hover-lift" style={{ borderRadius: '14px', fontSize: '13px', fontWeight: '700', padding: '12px 20px', width: '100%', justifyContent: 'center' }}>
          <LogOut size={16}/> Sign Out of Account
        </button>
      </div>
    </div>
  );
}
