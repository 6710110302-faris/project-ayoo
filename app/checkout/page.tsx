'use client'
import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Upload, CheckCircle2, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function CheckoutPage() {
  const { cart, clearCart } = useCart()
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [address, setAddress] = useState({ name: '', phone: '', fullAddress: '' })

  const totalPrice = cart.reduce((sum, item) => sum + (item.price || 0), 0)

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !address.name || !address.phone || !address.fullAddress) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วนและแนบสลิปการโอนเงิน')
      return
    }

    setUploading(true)
    try {
      // 1. อัปโหลดสลิปไปที่ Storage Bucket 'slips'
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('slips')
        .upload(fileName, file)

      if (uploadError) throw new Error('Upload Slip Failed: ' + uploadError.message)

      // 2. บันทึก Order (ต้องมีคอลัมน์ในตารางครบตามนี้)
      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: address.name,
          phone: address.phone,
          address: address.fullAddress,
          total_price: totalPrice,
          slip_url: fileName,
          items: cart, // ต้องเป็น type jsonb ใน Supabase
          status: 'pending'
        })

      if (orderError) throw new Error('Insert Order Failed: ' + orderError.message)

      alert('สั่งซื้อสำเร็จ! เราจะตรวจสอบและจัดส่งให้โดยเร็วที่สุด')
      clearCart()
      router.push('/')
    } catch (err: any) {
      console.error('Error details:', err)
      alert(`เกิดข้อผิดพลาด: ${err.message || 'กรุณาลองใหม่อีกครั้ง'}`)
    } finally {
      setUploading(false)
    }
  }

  if (cart.length === 0) return <div className="p-20 text-center font-black uppercase italic">No items in cart.</div>

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-12">
      <Link href="/cart" className="flex items-center gap-2 text-gray-400 mb-8 font-black text-[10px] tracking-widest no-underline hover:text-black transition-colors">
        <ChevronLeft size={16} /> BACK TO CART
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* QR & Slip Section */}
        <div className="space-y-8">
          <div className="bg-zinc-50 p-8 rounded-[40px] text-center border border-gray-100 shadow-inner">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Scan to Pay</p>
            <div className="bg-white p-4 rounded-3xl shadow-sm inline-block mb-4">
              {/* เปลี่ยน data เป็น PROMPTPAY ของคุณ */}
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PROMPTPAY_ID`} alt="QR" className="w-40 h-40" />
            </div>
            <h2 className="text-4xl font-black italic tracking-tighter">฿{totalPrice.toLocaleString()}</h2>
          </div>

          <div className="space-y-3">
            <span className="font-black text-[10px] text-gray-400 uppercase tracking-widest pl-2">Upload Slip</span>
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-200 rounded-[32px] cursor-pointer hover:bg-gray-50 transition-all group">
              {file ? (
                <div className="flex items-center gap-2 text-green-600 font-bold italic animate-in fade-in zoom-in duration-300">
                  <CheckCircle2 size={24} /> {file.name.length > 20 ? 'Slip Uploaded' : file.name}
                </div>
              ) : (
                <div className="text-center text-gray-400 group-hover:scale-110 transition-transform">
                  <Upload className="mx-auto mb-2" />
                  <p className="text-[10px] font-black uppercase italic">Click to upload slip</p>
                </div>
              )}
              <input type="file" className="hidden" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </label>
          </div>
        </div>

        {/* Shipping Form */}
        <form onSubmit={handleSubmitOrder} className="space-y-5">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-8">Shipping</h1>
          
          <input 
            required
            className="w-full bg-zinc-50 border-none p-6 rounded-[24px] font-black italic text-sm placeholder:text-gray-300 outline-none focus:ring-2 focus:ring-black transition-all"
            placeholder="YOUR NAME"
            value={address.name}
            onChange={(e) => setAddress({...address, name: e.target.value})}
          />
          
          <input 
            required
            type="tel"
            className="w-full bg-zinc-50 border-none p-6 rounded-[24px] font-black italic text-sm placeholder:text-gray-300 outline-none focus:ring-2 focus:ring-black transition-all"
            placeholder="PHONE NUMBER"
            value={address.phone}
            onChange={(e) => setAddress({...address, phone: e.target.value})}
          />

          <textarea 
            required
            className="w-full bg-zinc-50 border-none p-6 rounded-[32px] font-black italic text-sm placeholder:text-gray-300 outline-none focus:ring-2 focus:ring-black min-h-[150px] transition-all"
            placeholder="FULL ADDRESS"
            value={address.fullAddress}
            onChange={(e) => setAddress({...address, fullAddress: e.target.value})}
          />

          <button 
            type="submit"
            disabled={uploading}
            className={`w-full py-6 rounded-[28px] font-black text-xs tracking-[0.3em] uppercase transition-all shadow-xl flex items-center justify-center gap-2 ${
              uploading ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed' : 'bg-black text-white hover:bg-zinc-800 active:scale-95'
            }`}
          >
            {uploading ? (
              <><Loader2 className="animate-spin" size={16} /> PROCESSING...</>
            ) : (
              'CONFIRM ORDER'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}