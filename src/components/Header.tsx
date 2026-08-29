'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Bell, Home, Wallet, Sparkles } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();

  const getPageTitle = (path: string) => {
    if (path.startsWith('/dashboard')) return 'Dashboard';
    if (path.startsWith('/expenses')) return 'Expenses';
    if (path.startsWith('/shopping')) return 'Shopping List';
    if (path.startsWith('/inventory')) return 'Inventory';
    if (path.startsWith('/milk')) return 'Milk Tracker';
    if (path.startsWith('/reports')) return 'Analytics';
    if (path.startsWith('/calculator')) return 'Split Calculator';
    if (path.startsWith('/settings')) return 'Settings';
    if (path.startsWith('/budget')) return 'Budget Planner';
    if (path.startsWith('/priorities')) return 'Priorities';
    return 'HomeMate';
  };

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  return (
    <header className="top-header-bar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div>
          <h1 className="header-title-text">
            <span>{getPageTitle(pathname)}</span>
            {pathname === '/dashboard' && (
              <span className="header-live-badge">
                <Sparkles size={11} /> Live
              </span>
            )}
          </h1>
          <p className="header-subtitle-text">{todayStr}</p>
        </div>
      </div>

      {/* Right Action Icons: Notification Bell beside Home & Expenses shortcuts */}
      <div className="header-actions-group">
        {/* Home Link Shortcut */}
        <Link 
          href="/dashboard"
          className="header-action-btn"
          title="Home Dashboard"
          aria-label="Home"
        >
          <Home size={18} />
        </Link>

        {/* Expenses Link Shortcut */}
        <Link 
          href="/expenses"
          className="header-action-btn"
          title="Expenses Log"
          aria-label="Expenses"
        >
          <Wallet size={18} />
        </Link>

        {/* Single Notification Bell beside Home & Expenses */}
        <button 
          className="header-bell-btn"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell size={18} />
          <span className="bell-badge-count">2</span>
        </button>
      </div>
    </header>
  );
}
