'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { 
  Home, 
  LayoutDashboard, 
  Wallet, 
  ShoppingCart, 
  Package, 
  Droplets, 
  BarChart3, 
  Calculator, 
  Settings,
  LogOut,
  Target,
  User,
  Sparkles
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/expenses', label: 'Expenses', icon: Wallet },
    { href: '/shopping', label: 'Shopping List', icon: ShoppingCart },
    { href: '/inventory', label: 'Inventory', icon: Package },
    { href: '/milk', label: 'Milk Tracker', icon: Droplets },
    { href: '/reports', label: 'Analytics', icon: BarChart3 },
    { href: '/calculator', label: 'Split Calculator', icon: Calculator },
    { href: '/priorities', label: 'Priorities', icon: Target },
  ];

  return (
    <aside className="sidebar">
      {/* Bold & Attractive Brand Header */}
      <div className="sidebar-brand-header">
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <div className="sidebar-brand-icon">
            <Home size={22} color="white" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="sidebar-brand-title">HomeMate</span>
            <span className="sidebar-brand-subtitle">
              <Sparkles size={10} /> Household Hub
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}

        <div className="sidebar-divider"></div>

        <Link 
          href="/settings"
          className={`sidebar-link ${pathname === '/settings' ? 'sidebar-link-active' : ''}`}
        >
          <Settings size={18} />
          <span>Settings</span>
        </Link>
      </nav>

      {/* User Session Footer */}
      <div className="sidebar-user-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="sidebar-user-avatar">
            {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : <User size={16} />}
          </div>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <p style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-text)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {session?.user?.name || 'Household Admin'}
            </p>
            <p style={{ fontSize: '10px', color: 'var(--color-text-secondary)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {session?.user?.email || 'admin@homemate.app'}
            </p>
          </div>
        </div>

        <button 
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="btn-signout"
        >
          <LogOut size={13} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
