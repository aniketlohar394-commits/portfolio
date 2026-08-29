'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Wallet, ShoppingCart, Package, Droplets } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { href: '/expenses', label: 'Expenses', icon: Wallet },
    { href: '/shopping', label: 'Shopping', icon: ShoppingCart },
    { href: '/inventory', label: 'Inventory', icon: Package },
    { href: '/milk', label: 'Milk Log', icon: Droplets },
  ];

  return (
    <nav className="bottom-nav-bar">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
        const Icon = item.icon;
        
        return (
          <Link 
            key={item.href} 
            href={item.href}
            className={`bottom-nav-item ${isActive ? 'bottom-nav-active' : ''}`}
          >
            <Icon size={20} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
