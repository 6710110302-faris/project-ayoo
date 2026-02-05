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
  
  // States
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null) // 🌟 State สำหรับรูป Preview
  const [uploading, setUploading] = useState(false)
  const [address, setAddress] = useState({ name: '', phone: '', fullAddress: '' })

  const totalPrice = cart.reduce((sum, item) => sum + (item.price || 0), 0)

  // ฟังก์ชันจัดการการเลือกไฟล์และสร้าง Preview URL
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    if (selectedFile) {
      setFile(selectedFile)
      const objectUrl = URL.createObjectURL(selectedFile)
      setPreview(objectUrl)
    }
  }

  // Cleanup memory เมื่อ Component ถูกทำลาย
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

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

      // 2. บันทึก Order ลงตาราง orders
      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: address.name,
          phone: address.phone,
          address: address.fullAddress,
          total_price: totalPrice,
          slip_url: fileName,
          items: cart, // คอลัมน์ต้องเป็นประเภท jsonb
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
    <div className="max-w-4xl mx-auto p-6 md:p-12 font-sans bg-white min-h-screen">
      <Link href="/cart" className="flex items-center gap-2 text-zinc-400 mb-8 font-black text-[10px] tracking-widest no-underline hover:text-black transition-colors">
        <ChevronLeft size={16} /> BACK TO CART
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left: QR & Slip Preview Section */}
        <div className="space-y-8">
          <div className="bg-zinc-50 p-8 rounded-[40px] text-center border border-zinc-100 shadow-inner">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4">Scan to Pay (PromptPay)</p>
            <div className="bg-white p-4 rounded-3xl shadow-sm inline-block mb-4 border border-zinc-50">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PROMPTPAY_ID`} alt="QR" className="w-40 h-40 grayscale" />
            </div>
            <h2 className="text-4xl font-black italic tracking-tighter text-zinc-900">฿{totalPrice.toLocaleString()}</h2>
          </div>

          <div className="space-y-3">
            <span className="font-black text-[10px] text-zinc-400 uppercase tracking-widest pl-2">Upload Slip</span>
            
            {/* 🌟 ส่วน Preview สลิป */}
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-zinc-200 rounded-[32px] cursor-pointer hover:bg-zinc-50 transition-all group relative overflow-hidden bg-zinc-50/30">
              {preview ? (
                <>
                  <img src={preview} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" alt="Slip Preview" />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white font-black italic text-xs uppercase tracking-widest">Change Image</p>
                  </div>
                  <button 
                    type="button" 
                    onClick={(e) => { e.preventDefault(); setFile(null); setPreview(null); }}
                    className="absolute top-4 right-4 p-2 bg-white/90 text-black rounded-full shadow-lg hover:bg-black hover:text-white transition-all z-10"
                  >
                    <X size={16} />
                  </button>
                </>
              ) : (
                <div className="text-center text-zinc-300 group-hover:scale-110 transition-transform">
                  <Upload className="mx-auto mb-2" size={32} />
                  <p className="text-[10px] font-black uppercase italic tracking-widest">Tap to upload slip</p>
                </div>
              )}
              <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            </label>
            
            {file && (
              <p className="text-center text-[9px] font-black text-green-500 uppercase tracking-widest animate-pulse flex items-center justify-center gap-1">
                <CheckCircle2 size={12} /> Slip Loaded Successfully
              </p>
            )}
          </div>
        </div>

        {/* Right: Shipping Form */}
        <form onSubmit={handleSubmitOrder} className="space-y-6">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-8 text-zinc-900">Shipping Info</h1>
          
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black ml-4 mb-2 block text-zinc-400 tracking-widest uppercase">Full Name</label>
              <input 
                required
                className="w-full bg-zinc-50 border-none p-5 rounded-[22px] font-black italic text-sm placeholder:text-zinc-200 outline-none focus:ring-2 focus:ring-black transition-all text-zinc-900"
                placeholder="FIRSTNAME LASTNAME"
                value={address.name}
                onChange={(e) => setAddress({...address, name: e.target.value})}
              />
            </div>

            <div>
              <label className="text-[10px] font-black ml-4 mb-2 block text-zinc-400 tracking-widest uppercase">Phone Number</label>
              <input 
                required
                type="tel"
                className="w-full bg-zinc-50 border-none p-5 rounded-[22px] font-black italic text-sm placeholder:text-zinc-200 outline-none focus:ring-2 focus:ring-black transition-all text-zinc-900"
                placeholder="0XX-XXX-XXXX"
                value={address.phone}
                onChange={(e) => setAddress({...address, phone: e.target.value})}
              />
            </div>

            <div>
              <label className="text-[10px] font-black ml-4 mb-2 block text-zinc-400 tracking-widest uppercase">Full Address</label>
              <textarea 
                required
                className="w-full bg-zinc-50 border-none p-6 rounded-[28px] font-black italic text-sm placeholder:text-zinc-200 outline-none focus:ring-2 focus:ring-black min-h-[160px] transition-all text-zinc-900 resize-none"
                placeholder="HOUSE NO. / STREET / SUB-DISTRICT..."
                value={address.fullAddress}
                onChange={(e) => setAddress({...address, fullAddress: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={uploading || !file}
            className={`w-full py-6 rounded-[24px] font-black text-[10px] tracking-[0.4em] uppercase transition-all shadow-xl flex items-center justify-center gap-3 ${
              uploading ? 'bg-zinc-100 text-zinc-300 cursor-not-allowed' : 'bg-zinc-900 text-white hover:bg-black active:scale-95'
            }`}
          >
            {uploading ? (
              <><Loader2 className="animate-spin" size={16} /> Finalizing Order...</>
            ) : (
              'Confirm Order'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}