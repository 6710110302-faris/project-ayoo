'use client'
import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Upload, CheckCircle2, Loader2, X } from 'lucide-react'
import Link from 'next/link'

export default function CheckoutPage() {
  const { cart, clearCart } = useCart()
  const router = useRouter()
  
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [address, setAddress] = useState({ name: '', phone: '', fullAddress: '' })

  const totalPrice = cart.reduce((sum, item) => sum + (item.price || 0), 0)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    if (selectedFile) {
      setFile(selectedFile)
      const objectUrl = URL.createObjectURL(selectedFile)
      setPreview(objectUrl)
    }
  }

  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview) }
  }, [preview])

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !address.name || !address.phone || !address.fullAddress) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วนและแนบสลิปการโอนเงิน')
      return
    }

    setUploading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('กรุณาล็อกอินก่อนดำเนินการ')

      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('slips').upload(fileName, file)
      if (uploadError) throw uploadError

      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          customer_name: address.name,
          phone: address.phone,
          address: address.fullAddress,
          total_price: totalPrice, // 🌟 แก้เป็น total_price ตามชื่อใน Database
          slip_url: fileName,
          items: cart,
          status: 'pending'
        })

      if (orderError) throw orderError

      alert('สั่งซื้อสำเร็จ!')
      clearCart()
      router.push('/orders') 
    } catch (err: any) {
      alert(`เกิดข้อผิดพลาด: ${err.message}`)
    } finally {
      setUploading(false)
    }
  }

  if (cart.length === 0) return <div className="p-20 text-center font-black uppercase italic text-zinc-300">No items in cart.</div>

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-12 font-sans bg-white min-h-screen text-zinc-900">
      <Link href="/cart" className="flex items-center gap-2 text-zinc-400 mb-12 font-black text-[10px] tracking-widest no-underline hover:text-black transition-colors uppercase italic border-none bg-transparent cursor-pointer">
        <ChevronLeft size={16} /> Back to cart
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        <div className="space-y-10">
          <div className="bg-zinc-50 p-10 rounded-[48px] text-center border border-zinc-100 shadow-inner">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-300 mb-6 italic">Payment Terminal</p>
            <div className="bg-white p-6 rounded-[32px] shadow-sm inline-block mb-6 border border-zinc-100">
              <img src={"./qr.jpg"} alt="QR" className="w-40 h-40 grayscale" />
            </div>
            <h2 className="text-5xl font-black italic tracking-tighter text-zinc-900">฿{totalPrice.toLocaleString()}</h2>
          </div>

          <div className="space-y-4">
            <span className="font-black text-[10px] text-zinc-300 uppercase tracking-[0.3em] pl-4 italic">Upload Slip</span>
            <label className="flex flex-col items-center justify-center w-full h-80 border-2 border-dashed border-zinc-200 rounded-[40px] cursor-pointer hover:bg-zinc-50 transition-all relative overflow-hidden bg-zinc-50/50">
              {preview ? (
                <>
                  <img src={preview} className="w-full h-full object-cover" alt="Slip Preview" />
                  <button type="button" onClick={(e) => { e.preventDefault(); setFile(null); setPreview(null); }} className="absolute top-6 right-6 p-3 bg-white text-black rounded-full shadow-2xl border-none cursor-pointer hover:bg-black hover:text-white transition-all"><X size={16} /></button>
                </>
              ) : (
                <div className="text-center text-zinc-200">
                  <Upload className="mx-auto mb-4" size={40} />
                  <p className="text-[10px] font-black uppercase italic tracking-[0.3em]">Attach Transaction Slip</p>
                </div>
              )}
              <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            </label>
          </div>
        </div>

        <form onSubmit={handleSubmitOrder} className="space-y-8">
          <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none mb-10 text-zinc-900">Shipping</h1>
          <div className="space-y-6">
            <input required className="w-full bg-zinc-50 border-none p-6 rounded-[24px] font-black italic text-sm placeholder:text-zinc-200 outline-none focus:ring-2 focus:ring-black transition-all shadow-inner text-zinc-900" placeholder="FULL NAME" value={address.name} onChange={(e) => setAddress({...address, name: e.target.value})} />
            <input required type="tel" className="w-full bg-zinc-50 border-none p-6 rounded-[24px] font-black italic text-sm placeholder:text-zinc-200 outline-none focus:ring-2 focus:ring-black transition-all shadow-inner text-zinc-900" placeholder="PHONE NUMBER" value={address.phone} onChange={(e) => setAddress({...address, phone: e.target.value})} />
            <textarea required className="w-full bg-zinc-50 border-none p-8 rounded-[32px] font-black italic text-sm placeholder:text-zinc-200 outline-none focus:ring-2 focus:ring-black min-h-[180px] transition-all resize-none shadow-inner text-zinc-900 leading-relaxed" placeholder="SHIPPING ADDRESS..." value={address.fullAddress} onChange={(e) => setAddress({...address, fullAddress: e.target.value})} />
          </div>

          <button disabled={uploading || !file} className={`w-full py-8 rounded-full font-black text-[11px] tracking-[0.4em] uppercase transition-all shadow-2xl flex items-center justify-center gap-4 border-none cursor-pointer italic ${uploading ? 'bg-zinc-100 text-zinc-300' : 'bg-black text-white hover:bg-zinc-800 active:scale-95'}`}>
            {uploading ? <><Loader2 className="animate-spin" size={18} /> Processing...</> : 'Finalize Order'}
          </button>
        </form>
      </div>
    </div>
  )
}