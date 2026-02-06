'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Link from 'next/link'
import { Search, ShoppingBag, User, Package, AlertCircle } from 'lucide-react' 
import { useCart } from '../context/CartContext' 
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [hasNewTracking, setHasNewTracking] = useState(false)
  const { cart } = useCart() 
  const router = useRouter()

  const cartCount = cart.length

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setIsLoggedIn(true)
        setUserId(user.id)
        setUserRole(user.user_metadata?.role || 'user')
        checkTrackingStatus(user.id)
      }
    }
    checkUser()

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setIsLoggedIn(true)
        setUserId(session.user.id)
        setUserRole(session.user.user_metadata?.role || 'user')
        checkTrackingStatus(session.user.id)
      } else {
        setIsLoggedIn(false)
        setUserRole(null)
        setUserId(null)
        setHasNewTracking(false)
      }
    })

    // 🌟 Real-time: ฟังการอัปเดตเลขพัสดุ
    const ordersSubscription = supabase
      .channel('navbar-tracking-check')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'orders' 
      }, (payload) => {
        // ถ้าเลขพัสดุมีการอัปเดต และเป็นของ User คนนี้
        if (payload.new.user_id === userId && payload.new.tracking_number) {
          // ตรวจสอบกับ localStorage ว่าเป็นเลขใหม่จริงๆ หรือไม่
          const viewedIds = JSON.parse(localStorage.getItem('viewed_tracking_ids') || '[]')
          if (!viewedIds.includes(payload.new.id)) {
            setHasNewTracking(true)
          }
        }
      })
      .subscribe()

    return () => {
      authListener.subscription.unsubscribe()
      supabase.removeChannel(ordersSubscription)
    }
  }, [userId])

  // ฟังก์ชันเช็คสถานะตอนโหลดหน้า/รีเฟรช
  const checkTrackingStatus = async (uid: string) => {
    const { data: orders } = await supabase
      .from('orders')
      .select('id, tracking_number')
      .eq('user_id', uid)
      .not('tracking_number', 'is', null)

    if (orders && orders.length > 0) {
      // 🌟 ตรวจสอบว่า ID ออเดอร์ที่มีเลขพัสดุเหล่านี้ เคยถูกคลิกดูไปหรือยัง
      const viewedIds = JSON.parse(localStorage.getItem('viewed_tracking_ids') || '[]')
      const hasUnseen = orders.some(order => !viewedIds.includes(order.id))
      
      if (hasUnseen) {
        setHasNewTracking(true)
      }
    }
  }

  // 🌟 ฟังก์ชันจัดการเมื่อคลิกที่เมนู Orders
  const handleOrdersClick = async () => {
    setHasNewTracking(false)
    if (!userId) return

    // ดึงออเดอร์ทั้งหมดที่มีเลขพัสดุ ณ ตอนนี้
    const { data: orders } = await supabase
      .from('orders')
      .select('id')
      .eq('user_id', userId)
      .not('tracking_number', 'is', null)

    if (orders) {
      // บันทึก ID ออเดอร์เหล่านี้ลง localStorage เพื่อจำว่า "ดูแล้ว"
      const currentIds = orders.map(o => o.id)
      localStorage.setItem('viewed_tracking_ids', JSON.stringify(currentIds))
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/shop?search=${searchQuery}`) 
      setSearchQuery('')
    }
  }

  const NavLink = ({ href, children }: { href: string, children: React.ReactNode }) => (
    <Link href={href} className="relative group text-[11px] font-black tracking-[0.2em] no-underline text-black transition-colors hover:text-[#A855F7]">
      {children}
      <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#A855F7] transition-all duration-300 group-hover:w-full"></span>
    </Link>
  )

  return (
    <nav className="w-full bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between font-sans">
        
        <div className="w-1/3"></div>

        <div className="flex justify-center w-1/3">
          <Link href="/" className="no-underline">
            <div className="bg-[#A855F7] text-white px-8 py-2 rounded-full transform -rotate-2 font-black text-xl italic shadow-lg hover:scale-105 transition-all duration-300">
              FOUFIVVEL
            </div>
          </Link>
        </div>

        <div className="flex items-center justify-end gap-5 w-1/3 text-black">
          {userRole === 'admin' && (
            <Link href="/admin/add/dashboard" className="text-[10px] font-black border-2 border-black px-4 py-1.5 rounded-full hover:bg-black hover:text-white transition-all no-underline tracking-tighter hidden lg:block mr-2">
              DASHBOARD
            </Link>
          )}
          
          <Link href={isLoggedIn ? "/profile" : "/login"} className="hover:opacity-50 transition p-1 text-black">
            <User size={22} strokeWidth={2.5} />
          </Link>

          {isLoggedIn && (
            <Link 
              href="/orders" 
              className="relative hover:opacity-50 transition p-1 text-black no-underline" 
              title="My Orders"
              onClick={handleOrdersClick} // 🌟 เรียกฟังก์ชันบันทึกสถานะการดู
            >
              <Package size={22} strokeWidth={2.5} />
              
              {hasNewTracking && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 items-center justify-center border border-white">
                    <AlertCircle size={10} className="text-white fill-white" />
                  </span>
                </span>
              )}
            </Link>
          )}
          
          <form onSubmit={handleSearch} className="relative flex items-center group">
            <input 
              type="text"
              placeholder="SEARCH..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-0 group-hover:w-40 md:group-hover:w-64 focus:w-40 md:focus:w-64 transition-all duration-500 ease-in-out pl-0 group-hover:pl-4 focus:pl-4 pr-10 py-2 bg-zinc-50 rounded-full border-none outline-none font-black italic text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 focus:opacity-100"
            />
            <button type="submit" className="absolute right-0 p-1 hover:opacity-50 transition-all text-black bg-transparent border-none cursor-pointer">
              <Search size={22} strokeWidth={2.5} />
            </button>
          </form>
          
          <Link href="/cart" className="relative hover:opacity-50 transition p-1 text-black no-underline">
            <ShoppingBag size={22} strokeWidth={2.5} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-black text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold border border-white animate-in zoom-in">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      <div className="flex justify-center gap-10 py-3 border-t border-gray-50 bg-white">
        <NavLink href="/">NEW ARRIVALS</NavLink>
        <NavLink href="/categories">CATEGORIES</NavLink>
        <NavLink href="/about">ABOUT US</NavLink>
        <NavLink href="/contact">CONTACT US</NavLink>
      </div>
    </nav>
  )
}