'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/atoms/button'
import {
  LayoutDashboard,
  Target,
  Calendar,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  { name: 'Goals', href: '/goals', icon: Target },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error('Error signing out')
    } else {
      router.push('/login')
    }
  }

  return (
    <>
      {/* Mobile header */}
      <div className="fixed top-0 right-0 left-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isHydrated && isMobileMenuOpen ? <X /> : <Menu />}
        </Button>
        <Link
          href="/"
          className="text-primary text-lg font-semibold transition-opacity hover:opacity-80"
        >
          Goal Pilot
        </Link>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform border-r border-gray-200 bg-white transition-transform duration-200 ease-in-out',
          isHydrated && isMobileMenuOpen
            ? 'translate-x-0'
            : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className="flex h-full flex-col">
          <div className="hidden h-16 items-center justify-center border-b lg:flex">
            <Link
              href="/"
              className="text-primary text-xl font-bold transition-opacity hover:opacity-80"
            >
              Goal Pilot
            </Link>
          </div>

          <nav className="flex-1 space-y-1 px-4 pt-8 pb-4 lg:pt-4">
            {navigation.map((item) => {
              const isActive =
                item.href === '/goals'
                  ? pathname.startsWith('/goals')
                  : pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-700 hover:bg-gray-50',
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          <div className="border-t p-4">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5" />
              Sign out
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {isHydrated && isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 cursor-pointer bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}
