'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  Package,
  HelpCircle,
  MessageCircle,
  Search,
  User,
  ShoppingCart,
  Wallet,
  Settings,
  LogOut,
  LayoutDashboard,
  ChevronDown,
  History,
  Link2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useCart } from '@/components/providers/CartProvider'

interface HeaderProps {
  userEmail?: string | null
  balance?: number
}

export default function Header({ userEmail, balance }: HeaderProps) {
  const [profileOpen, setProfileOpen] = useState(false)
  const [cartHover, setCartHover] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const router = useRouter()
  const supabase = createClient()
  const { items, count, total } = useCart()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="w-full bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-gray-900 text-gray-300 text-sm py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/track"
              className="flex items-center gap-1.5 hover:text-yellow-400 transition-colors"
            >
              <Package size={14} />
              <span>איפה החבילה שלי?</span>
            </Link>
            <Link
              href="/faq"
              className="flex items-center gap-1.5 hover:text-yellow-400 transition-colors"
            >
              <HelpCircle size={14} />
              <span>שאלות ותשובות</span>
            </Link>
          </div>
          <a
            href="https://wa.me/972500000000"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-green-400 transition-colors"
          >
            <MessageCircle size={14} />
            <span>צ&apos;אט עם נציג</span>
          </a>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <div className="text-3xl font-black tracking-tight">
            <span className="gold-text">PALI</span>
          </div>
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-xl mx-4">
          <div className="relative">
            <Search
              size={18}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <Input
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              placeholder="חפש מוצר..."
              className="pr-10 text-right"
              onKeyDown={e => {
                if (e.key === 'Enter' && searchValue.trim()) {
                  router.push(`/search?q=${encodeURIComponent(searchValue)}`)
                }
              }}
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Profile */}
          {userEmail ? (
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-1.5 text-gray-700 hover:text-yellow-600 transition-colors font-medium"
              >
                <User size={20} />
                <span className="text-sm hidden sm:inline">האזור שלי</span>
                <ChevronDown size={14} className={`transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              {profileOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs text-gray-500">מחובר כ:</p>
                    <p className="text-sm font-medium text-gray-800 truncate">{userEmail}</p>
                    {balance !== undefined && (
                      <p className="text-xs text-yellow-600 font-semibold mt-0.5">
                        יתרה: {balance.toLocaleString()} נקודות
                      </p>
                    )}
                  </div>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setProfileOpen(false)}
                  >
                    <LayoutDashboard size={16} />
                    הדשבורד שלי
                  </Link>
                  <Link
                    href="/orders"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setProfileOpen(false)}
                  >
                    <History size={16} />
                    היסטוריית הזמנות
                  </Link>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setProfileOpen(false)}
                  >
                    <Link2 size={16} />
                    הקישורית שלי
                  </Link>
                  <Link
                    href="/wallet"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setProfileOpen(false)}
                  >
                    <Wallet size={16} />
                    הארנק שלי (PALI Wallet)
                  </Link>
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setProfileOpen(false)}
                  >
                    <Settings size={16} />
                    הגדרות חשבון
                  </Link>
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={16} />
                      התנתק
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link href="/auth/login">
              <Button variant="outline" size="sm" className="gap-2">
                <User size={16} />
                <span className="hidden sm:inline">כניסה</span>
              </Button>
            </Link>
          )}

          {/* Cart with badge + hover preview */}
          <div
            className="relative"
            onMouseEnter={() => setCartHover(true)}
            onMouseLeave={() => setCartHover(false)}
          >
            <Link href="/cart" className="relative text-gray-700 hover:text-yellow-600 transition-colors flex items-center">
              <ShoppingCart size={22} />
              {count > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </Link>

            {/* Hover mini-cart */}
            {cartHover && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-lg py-3 z-50">
                {count === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">העגלה ריקה</p>
                ) : (
                  <>
                    <div className="px-3 space-y-2 max-h-48 overflow-y-auto">
                      {items.slice(0, 3).map(item => (
                        <div key={item.product_id} className="flex items-center gap-2">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.name} className="w-10 h-10 object-cover rounded" />
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                              <Package size={14} className="text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-800 truncate">{item.name}</p>
                            <p className="text-xs text-gray-500">×{item.quantity} — ₪{(item.price * item.quantity).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                      {items.length > 3 && (
                        <p className="text-xs text-gray-400 text-center">+{items.length - 3} פריטים נוספים</p>
                      )}
                    </div>
                    <div className="border-t border-gray-100 mt-2 pt-2 px-3 flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-900">₪{total.toLocaleString()}</span>
                      <Link href="/cart" className="text-xs bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold px-3 py-1.5 rounded-lg transition-colors">
                        לעגלה
                      </Link>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
