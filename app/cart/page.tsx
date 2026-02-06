'use client'
import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Trash2, ChevronLeft, ShoppingBag, Lock, Loader2 } from 'lucide-react'

export default function CartPage() {
  const { cart, removeFromCart, clearCart } = useCart()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setAuthLoading(false)
    }
    checkUser()
  }, [])

  const totalPrice = cart.reduce((sum, item) => sum + (item.price || 0), 0)

  const handleCheckout = () => {
    if (!user) {
      alert('กรุณาล็อกอินก่อนดำเนินการชำระเงิน')
      router.push('/login')
      return
    }
    router.push('/checkout')
  }

  if (cart.length === 0) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9F9F9] p-6 text-center">
      <div className="bg-white p-12 rounded-[50px] shadow-sm border border-zinc-50 mb-6">
        <ShoppingBag size={64} className="text-zinc-100" />
      </div>
      <h1 className="text-3xl font-black uppercase italic tracking-tighter mb-4 text-zinc-900">Cart is empty</h1>
      <Link href="/" className="bg-zinc-900 text-white px-10 py-4 rounded-2xl font-black text-[10px] tracking-widest uppercase hover:bg-black transition-all">
        BACK TO SHOPPING
      </Link>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-12 font-sans bg-[#F9F9F9] min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
        <div>
          <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-black mb-6 font-black text-[10px] tracking-[0.2em] uppercase no-underline">
            <ChevronLeft size={14} /> Continue Shopping
          </Link>
          <h1 className="text-6xl font-black uppercase italic tracking-tighter leading-none text-zinc-900">My Cart</h1>
        </div>
        <button onClick={clearCart} className="text-zinc-300 hover:text-red-500 font-black text-[10px] tracking-[0.2em] uppercase transition-colors">
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          {cart.map((item, index) => (
            <div key={`${item.id}-${item.size}-${index}`} className="flex gap-8 p-6 rounded-[40px] bg-white border border-zinc-50 shadow-sm items-center group">
              <div className="w-32 h-32 rounded-[30px] overflow-hidden bg-[#F9F9F9] border border-zinc-100 flex-shrink-0">
                <img 
                  src={Array.isArray(item.image_url) ? item.image_url[0] : item.image_url} 
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-700" 
                  alt={item.name} 
                />
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-black uppercase italic text-xl tracking-tight text-zinc-900">{item.name}</h3>
                    <p className="bg-zinc-50 px-3 py-1 rounded-full font-black text-[8px] uppercase text-zinc-400 border border-zinc-100 mt-2 inline-block">Size: {item.size}</p>
                  </div>
                  <button onClick={() => removeFromCart(item.id, item.size)} className="p-3 text-zinc-200 hover:text-red-500 transition-all">
                    <Trash2 size={20} />
                  </button>
                </div>
                <p className="mt-6 font-black text-2xl italic tracking-tighter text-zinc-900">฿{item.price?.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-10 rounded-[48px] sticky top-24 border border-zinc-50 shadow-xl shadow-zinc-100/50">
            <h2 className="font-black uppercase italic text-xl mb-10 tracking-[0.1em] text-zinc-900">Summary</h2>
            <div className="space-y-6 mb-12">
              <div className="flex justify-between text-zinc-300 font-black text-[10px] tracking-widest uppercase">
                <span>Subtotal</span>
                <span>฿{totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-zinc-300 font-black text-[10px] tracking-widest uppercase">
                <span>Shipping</span>
                <span className="text-zinc-900 font-black italic">Free</span>
              </div>
              <div className="border-t border-zinc-50 pt-8 flex justify-between items-end">
                <span className="font-black uppercase italic text-xs text-zinc-400">Total</span>
                <span className="font-black text-4xl italic tracking-tighter text-zinc-900">฿{totalPrice.toLocaleString()}</span>
              </div>
            </div>
            <button 
              onClick={handleCheckout}
              disabled={authLoading}
              className="w-full py-6 rounded-[24px] bg-zinc-900 text-white font-black text-[10px] tracking-[0.3em] uppercase hover:bg-black transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95 shadow-zinc-200"
            >
              {authLoading ? <Loader2 className="animate-spin" size={14} /> : !user ? <Lock size={14} /> : null}
              {authLoading ? 'Loading...' : !user ? 'Login to Checkout' : 'Proceed to Checkout'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}