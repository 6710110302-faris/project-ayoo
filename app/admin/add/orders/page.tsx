'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { CheckCircle, Package, Loader2, XCircle, ArrowLeft, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function OrderManagement() {
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      // ดึงข้อมูลและเรียงตาม status เพื่อให้ pending อยู่บนสุดเสมอ
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('status', { ascending: false }) 
        .order('id', { ascending: false }) 
      
      if (error) throw error
      setOrders(data || [])
    } catch (err: any) {
      console.error("Fetch Error:", err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsSold = async (orderId: string, orderItems: any[]) => {
    const confirm = window.confirm('ยืนยันการขายและปรับสินค้าเป็น SOLD OUT?')
    if (!confirm) return

    try {
      // 1. ปรับสถานะสินค้าเป็น Sold ในตาราง products
      for (const item of orderItems) {
        await supabase.from('products').update({ is_sold: true }).eq('id', item.id)
      }
      
      // 2. อัปเดตสถานะออเดอร์เป็น 'completed' เพื่อให้ย้ายกลุ่ม
      const { error } = await supabase
        .from('orders')
        .update({ status: 'completed' })
        .eq('id', orderId)
      
      if (error) throw error

      alert('SUCCESS: ยืนยันรายการเรียบร้อย')
      fetchOrders() // รีโหลดข้อมูลใหม่จาก Database เพื่อความแม่นยำ
    } catch (err: any) {
      alert('Error: ' + err.message)
    }
  }

  const handleCancelOrder = async (orderId: string) => {
    const confirm = window.confirm('คุณต้องการยกเลิกและลบออเดอร์นี้ใช่หรือไม่?')
    if (!confirm) return

    try {
      const { error } = await supabase.from('orders').delete().eq('id', orderId)
      if (error) throw error
      
      setOrders(prev => prev.filter(order => order.id !== orderId))
      alert('CANCELLED: ลบข้อมูลออเดอร์เรียบร้อย')
    } catch (err: any) {
      alert('Error: ' + err.message)
    }
  }

  // 🌟 จุดสำคัญ: แก้ไข Logic การแยกกลุ่มเพื่อให้ Confirm แล้วย้ายฝั่งแน่นอน
  const pendingOrders = orders.filter(o => 
    !o.status || o.status === 'pending' || o.status === ''
  )
  const confirmedOrders = orders.filter(o => 
    o.status === 'completed'
  )

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <Loader2 className="animate-spin text-zinc-200" size={48} />
      <p className="mt-4 font-black italic text-zinc-200 tracking-[0.5em] text-[10px] uppercase">Accessing Vault...</p>
    </div>
  )

  const OrderCard = ({ order, isConfirmed }: { order: any, isConfirmed: boolean }) => (
    <div className={`border border-zinc-100 rounded-[40px] p-8 flex flex-col lg:flex-row gap-8 items-center shadow-sm transition-all ${isConfirmed ? 'bg-zinc-50/20 opacity-75' : 'bg-zinc-50/50 hover:shadow-md'}`}>
      <div className="flex gap-4 w-full lg:w-auto shrink-0">
        <div className="w-24 h-32 rounded-[20px] overflow-hidden bg-zinc-200 border border-zinc-100 relative group">
          <img 
            src={order.items?.[0]?.image_url?.[0] || order.items?.[0]?.image_url} 
            className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
            alt="Product"
          />
        </div>
        <div className="w-24 h-32 rounded-[20px] overflow-hidden bg-zinc-100 border border-zinc-100 relative group cursor-zoom-in">
          {/* ดึงรูปสลิปจาก Bucket slips */}
          <a href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/slips/${order.slip_url}`} target="_blank">
            <img 
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/slips/${order.slip_url}`} 
              className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all"
              alt="Transfer Slip"
            />
          </a>
        </div>
      </div>

      <div className="flex-1 space-y-3 w-full">
        <div className="flex items-center gap-3 text-zinc-900">
          <span className={`px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${isConfirmed ? 'bg-zinc-300 text-white' : 'bg-zinc-900 text-white'}`}>
            {isConfirmed ? <div className="flex items-center gap-1"><Check size={10} /> CONFIRMED</div> : 'PENDING'}
          </span>
          <span className="text-[9px] font-black text-zinc-200 uppercase italic">ID: {order.id}</span>
        </div>
        <div>
          <h2 className="font-black text-2xl uppercase italic tracking-tight text-zinc-900">{order.customer_name}</h2>
          <p className="font-black text-[10px] text-zinc-400 tracking-widest">{order.phone}</p>
          <div className="mt-3 bg-white/50 p-4 rounded-2xl border border-zinc-50 text-[11px] font-bold text-zinc-500 leading-relaxed max-w-md">
            {order.address}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {order.items?.map((item: any, i: number) => (
            <div key={i} className="text-[9px] font-black bg-black text-white px-3 py-1.5 rounded-lg uppercase italic">
              {item.name}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center lg:items-end justify-between self-stretch gap-6 min-w-[200px]">
        <div className="text-center lg:text-right">
          <p className="text-[9px] font-black text-zinc-300 uppercase tracking-[0.3em] mb-1 text-zinc-900">Grand Total</p>
          <p className="text-4xl font-black italic tracking-tighter text-zinc-900">฿{order.total_price?.toLocaleString()}</p>
        </div>

        {!isConfirmed && (
          <div className="flex gap-3 w-full">
            <button 
              onClick={() => handleCancelOrder(order.id)} 
              className="flex-1 bg-white border border-zinc-200 text-zinc-400 px-6 py-4 rounded-full font-black text-[9px] uppercase tracking-widest hover:border-red-200 hover:text-red-400 transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={() => handleMarkAsSold(order.id, order.items)} 
              className="flex-[1.5] bg-black text-white px-8 py-4 rounded-full font-black text-[9px] uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200 flex items-center justify-center gap-2 font-sans"
            >
              Confirm <CheckCircle size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-12 font-sans bg-white min-h-screen">
      <button 
        onClick={() => router.back()} 
        className="flex items-center gap-2 text-zinc-400 mb-12 font-black text-[10px] tracking-widest hover:text-black transition-colors uppercase italic border-none bg-transparent cursor-pointer"
      >
        <ArrowLeft size={16} /> Go Back
      </button>

      {/* 🚀 Section 1: Pending Orders */}
      <div className="mb-24">
        <div className="mb-10 flex items-end justify-between border-b border-zinc-100 pb-8 text-zinc-900">
          <div>
            <h1 className="text-6xl font-black uppercase italic tracking-tighter leading-none">Pending</h1>
            <p className="text-[10px] font-black text-zinc-300 mt-4 uppercase tracking-[0.4em]">Awaiting Verification</p>
          </div>
          <span className="font-black italic text-zinc-100 text-7xl leading-none">{pendingOrders.length}</span>
        </div>
        <div className="grid gap-8">
          {pendingOrders.length > 0 ? pendingOrders.map(o => <OrderCard key={o.id} order={o} isConfirmed={false} />) : (
            <div className="py-20 text-center bg-zinc-50/50 rounded-[40px] border border-dashed border-zinc-100">
               <p className="text-zinc-200 font-black italic uppercase text-[10px] tracking-widest">No pending orders in vault</p>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Section 2: Confirmed Orders */}
      <div className="mt-32">
        <div className="mb-10 flex items-end justify-between border-b border-zinc-100 pb-8 text-zinc-900">
          <div>
            <h1 className="text-6xl font-black uppercase italic tracking-tighter leading-none text-zinc-400/50">Confirmed</h1>
            <p className="text-[10px] font-black text-zinc-300 mt-4 uppercase tracking-[0.4em]">Successfully Processed</p>
          </div>
          <span className="font-black italic text-zinc-50 text-7xl leading-none">{confirmedOrders.length}</span>
        </div>
        <div className="grid gap-8">
          {confirmedOrders.length > 0 ? confirmedOrders.map(o => <OrderCard key={o.id} order={o} isConfirmed={true} />) : (
            <div className="py-20 text-center rounded-[40px] border-2 border-dashed border-zinc-50">
               <p className="text-zinc-100 font-black italic uppercase text-[10px] tracking-widest">History is empty</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}