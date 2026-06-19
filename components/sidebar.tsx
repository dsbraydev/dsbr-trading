'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { TrendingUp, Building2, Trophy, CheckSquare, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { signOut } from '@/app/actions'
import { Button } from '@/components/ui/button'

const navItems = [
  { href: '/trades', label: 'Trades', icon: TrendingUp },
  { href: '/accounts', label: 'Accounts', icon: Building2 },
  { href: '/challenge', label: 'Challenge', icon: Trophy },
  { href: '/checklist', label: 'Checklist', icon: CheckSquare },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-52 shrink-0 flex flex-col border-r border-border bg-sidebar h-screen sticky top-0">
      <div className="px-4 py-5 border-b border-border">
        <span className="font-semibold text-sm tracking-tight">Trading Journal</span>
      </div>

      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors',
              pathname.startsWith(href)
                ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
            )}
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-2 border-t border-border">
        <form action={signOut}>
          <Button
            variant="ghost"
            size="sm"
            type="submit"
            className="w-full justify-start gap-2 text-sidebar-foreground"
          >
            <LogOut className="size-4" />
            Sign out
          </Button>
        </form>
      </div>
    </aside>
  )
}
