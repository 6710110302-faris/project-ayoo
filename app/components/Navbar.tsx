'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Link from 'next/link'
import { Search, ShoppingBag, User } from 'lucide-react'
import { useCart } from '../context/CartContext' // 1. นำเข้า useCart

export default function Navbar() {
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const { cart } = useCart() // 2. ดึงข้อมูล cart มาใช้งาน

  // คำนวณจำนวนชิ้นในตะกร้า
  const cartCount = cart.length

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setIsLoggedIn(true)
        setUserRole(user.user_metadata?.role || 'user')
      }
    }
    checkUser()

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setIsLoggedIn(true)
        setUserRole(session.user.user_metadata?.role || 'user')
      } else {
        setIsLoggedIn(false)
        setUserRole(null)
      }
    })

    return () => authListener.subscription.unsubscribe()
  }, [])

  return (
    <nav className="w-full bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        <div className="w-1/3"></div>

        <div className="flex justify-center w-1/3">
          <Link href="/" className="no-underline">
            <div className="bg-[#A855F7] text-white px-8 py-2 rounded-full transform -rotate-2 font-black text-xl italic shadow-lg hover:scale-105 transition-all duration-300">
              FOUFIVVEL
            </div>
          </Link>
        </div>

        <div className="flex items-center justify-end gap-5 w-1/3 text-black font-sans">
          {userRole === 'admin' && (
            <Link 
              href="/admin/add/dashboard" 
              className="text-[10px] font-black border-2 border-black px-4 py-1.5 rounded-full hover:bg-black hover:text-white transition-all no-underline tracking-tighter"
            >
              DASHBOARD
            </Link>
          )}
          
          <Link href={isLoggedIn ? "/profile" : "/login"} className="hover:opacity-50 transition p-1 text-black">
            <User size={22} strokeWidth={2.5} />
          </Link>
          
          <button className="hover:opacity-50 transition p-1 text-black">
            <Search size={22} strokeWidth={2.5} />
          </button>
          
          {/* 3. แก้ไข Link ไปหน้า /cart และแสดงตัวเลขจริง */}
          <Link href="/cart" className="relative hover:opacity-50 transition p-1 text-black no-underline">
            <ShoppingBag size={22} strokeWidth={2.5} />
            
            {/* แสดง Badge เฉพาะเมื่อมีสินค้าในตะกร้าเท่านั้น */}
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-black text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold border border-white animate-in zoom-in">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      <div className="flex justify-center gap-10 py-3 border-t border-gray-50 bg-white">
        <Link href="/" className="text-[11px] font-black tracking-[0.2em] hover:text-[#A855F7] transition no-underline text-black">NEW ARRIVALS</Link>
        <Link href="/about" className="text-[11px] font-black tracking-[0.2em] hover:text-[#A855F7] transition no-underline text-black uppercase">ABOUT US</Link>
        <Link href="/contact" className="text-[11px] font-black tracking-[0.2em] hover:text-[#A855F7] transition no-underline text-black uppercase">CONTACT US</Link>
      </div>
    </nav>
  )
}