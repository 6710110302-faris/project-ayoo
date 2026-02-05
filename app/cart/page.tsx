'use client'
import { useCart } from '../context/CartContext'
import Link from 'next/link'
import { Trash2, ChevronLeft, ShoppingBag } from 'lucide-react'

export default function CartPage() {
  const { cart, removeFromCart, clearCart } = useCart()

  // คำนวณราคารวม
  const totalPrice = cart.reduce((sum, item) => sum + (item.price || 0), 0)

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-gray-100 p-8 rounded-full mb-6">
          <ShoppingBag size={48} className="text-gray-400" />
        </div>
        <h1 className="text-3xl font-black uppercase italic mb-4">ตะกร้าของคุณว่างเปล่า</h1>
        <p className="text-gray-500 mb-8 font-medium">ดูเหมือนว่าคุณยังไม่ได้เลือกสินค้าชิ้นไหนเลย</p>
        <Link 
          href="/checkout" 
          className="bg-black text-white px-10 py-4 rounded-2xl font-black text-sm tracking-widest hover:bg-zinc-800 transition-all active:scale-95"
        >
          BACK TO SHOPPING
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-12">
      {/* Header */}
      <div className="flex justify-between items-end mb-12">
        <div>
          <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-black mb-4 transition-all font-bold text-xs tracking-widest">
            <ChevronLeft size={16} />
            CONTINUE SHOPPING
          </Link>
          <h1 className="text-5xl font-black uppercase italic tracking-tighter">My Cart</h1>
        </div>
        <button 
          onClick={clearCart}
          className="text-gray-400 hover:text-red-500 font-bold text-xs tracking-widest uppercase transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* รายการสินค้า (Left Side) */}
        <div className="lg:col-span-2 space-y-6">
          {cart.map((item, index) => (
            <div 
              key={`${item.id}-${index}`} 
              className="flex gap-6 p-4 rounded-[32px] bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow items-center"
            >
              {/* รูปสินค้า */}
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0">
                <img 
                  src={Array.isArray(item.image_url) ? item.image_url[0] : item.image_url} 
                  className="w-full h-full object-cover"
                  alt={item.name}
                />
              </div>

              {/* ข้อมูลสินค้า */}
              <div className="flex-grow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-black uppercase italic text-lg leading-tight">{item.name}</h3>
                    <p className="text-gray-400 text-xs font-bold mt-1 uppercase">Size: {item.size}</p>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="mt-4">
                  <p className="font-black text-blue-600">฿{item.price?.toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* สรุปยอดเงิน (Right Side / Sticky) */}
        <div className="lg:col-span-1">
          <div className="bg-zinc-50 p-8 rounded-[40px] sticky top-24 border border-gray-100">
            <h2 className="font-black uppercase italic text-xl mb-6 tracking-tight">Order Summary</h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-gray-500 font-bold text-sm">
                <span>Items ({cart.length})</span>
                <span>฿{totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-500 font-bold text-sm">
                <span>Shipping</span>
                <span className="text-green-600 uppercase">Free</span>
              </div>
              <div className="border-t border-gray-200 pt-4 flex justify-between">
                <span className="font-black uppercase italic">Total</span>
                <span className="font-black text-xl">฿{totalPrice.toLocaleString()}</span>
              </div>
            </div>

            <button 
              className="w-full bg-black text-white py-5 rounded-2xl font-black text-sm tracking-[0.2em] uppercase hover:bg-zinc-800 transition-all active:scale-95 shadow-xl shadow-zinc-200"
              onClick={() => alert('กำลังเชื่อมต่อระบบชำระเงิน...')}
            >
              Checkout Now
            </button>

            <p className="text-[10px] text-gray-400 text-center mt-6 font-bold uppercase tracking-widest">
              Secure Checkout • 100% Authentic
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}