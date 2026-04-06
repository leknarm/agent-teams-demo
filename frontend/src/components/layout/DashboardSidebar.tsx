'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, LayoutDashboard, Settings, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/forms', label: 'My Forms', icon: FileText },
];

const secondaryItems = [
  { href: '#', label: 'Settings', icon: Settings },
  { href: '#', label: 'Help', icon: HelpCircle },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 bg-card border-r border-border flex flex-col shrink-0 shadow-sm">
      {/* Logo area */}
      <div className="h-16 flex items-center px-5 border-b border-border">
        <Link href="/forms" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
            <LayoutDashboard className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-base tracking-tight">FormCraft</span>
        </Link>
      </div>

      {/* Primary navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-2 pb-2 pt-1">
          Workspace
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon
                className={cn(
                  'h-4 w-4 shrink-0',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              />
              {item.label}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Secondary navigation at the bottom */}
      <div className="px-3 py-4 border-t border-border space-y-0.5">
        {secondaryItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-150"
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}

        {/* User avatar placeholder */}
        <div className="flex items-center gap-3 px-3 py-2 mt-2 rounded-lg border border-border bg-muted/50">
          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-primary">U</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">My Workspace</p>
            <p className="text-[10px] text-muted-foreground truncate">Free plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
