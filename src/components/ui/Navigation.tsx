'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ReceiptText } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:top-0 md:bottom-auto z-50 bg-background/80 backdrop-blur-md border-t md:border-t-0 md:border-b border-white/10 px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-center md:justify-start gap-8">
        <Link 
          href="/" 
          className={cn(
            "flex items-center gap-2 text-sm font-medium transition-colors hover:text-foreground",
            pathname === '/' ? "text-primary" : "text-muted-foreground"
          )}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </Link>

        <Link 
          href="/transactions" 
          className={cn(
            "flex items-center gap-2 text-sm font-medium transition-colors hover:text-foreground",
            pathname === '/transactions' ? "text-primary" : "text-muted-foreground"
          )}
        >
          <ReceiptText size={18} />
          <span>Transações</span>
        </Link>
      </div>
    </nav>
  );
}
