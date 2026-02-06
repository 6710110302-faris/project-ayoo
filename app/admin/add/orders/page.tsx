'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { CheckCircle, Package, Loader2, XCircle, ArrowLeft, Eye, X, Truck, Plus, Save } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function OrderManagement() {
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<any>(null) // Pop-up รายละเอียดสลิป/ที่อยู่
  const [trackingOrder, setTrackingOrder] = useState<any>(null) // Pop-up สำหรับกรอกเลขพัสดุอย่างเดียว
  const [activeTab, setActiveTab] = useState<'slip' | number>('slip')
  const [trackingNum, setTrackingNum] = useState('')

  useEffect(() => { fetchOrders() }, [])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('status', { ascending: false })
        .order('id', { ascending: false }) 
      if (error) throw error
      setOrders(data || [])
    } catch (err: any) { console.error(err.message) } finally { setLoading(false) }
  }

  const pendingOrders = orders.filter(o => o.status === 'pending')
  const confirmedOrders = orders.filter(o => o.status === 'completed')
  const canceledOrders = orders.filter(o => o.status === 'canceled')

  const handleMarkAsSold = async (orderId: string, orderItems: any[]) => {
    if (!window.confirm('ยืนยันออเดอร์และตัดสต็อกสินค้า?')) return
    try {
      for (const item of orderItems) {
        await supabase.from('products').update({ is_sold: true }).eq('id', item.id)
      }
      await supabase.from('orders').update({ status: 'completed' }).eq('id', orderId)
      alert('Confirmed: ออเดอร์ถูกยืนยันแล้ว')
      fetchOrders() 
      setSelectedOrder(null) 
    } catch (err: any) { alert(err.message) }
  }

  const handleUpdateTracking = async (orderId: string) => {
    if (!trackingNum) return alert('กรุณากรอกเลขพัสดุ')
    try {
      const { error } = await supabase.from('orders').update({ tracking_number: trackingNum }).eq('id', orderId)
      if (error) throw error
      alert('SUCCESS: บันทึกเลขพัสดุสำเร็จ')
      setTrackingNum('')
      setTrackingOrder(null)
      setSelectedOrder(null) // ปิดทั้งสองแบบหากเปิดอยู่
      fetchOrders()
    } catch (err: any) { alert(err.message) }
  }

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm('ยกเลิกออเดอร์นี้?')) return
    try {
      await supabase.from('orders').update({ status: 'canceled' }).eq('id', orderId)
      fetchOrders(); setSelectedOrder(null)
    } catch (err: any) { alert(err.message) }
  }

  const OrderCard = ({ order, statusType }: { order: any, statusType: string }) => (
    <div className={`border border-zinc-100 rounded-[40px] p-8 flex flex-col lg:flex-row gap-8 items-center transition-all ${statusType === 'completed' ? 'bg-zinc-50/20' : statusType === 'canceled' ? 'bg-red-50/10' : 'bg-zinc-50/50 shadow-sm'}`}>
      <div className="w-24 h-32 rounded-[20px] overflow-hidden bg-zinc-200 shrink-0">
        <img src={order.items?.[0]?.image_url?.[0] || order.items?.[0]?.image_url} className="w-full h-full object-cover" alt="" />
      </div>
      
      <div className="flex-1 space-y-4 w-full text-zinc-900">
        <div className="flex items-center gap-3">
          <span className={`px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${statusType === 'completed' ? 'bg-green-500 text-white' : statusType === 'canceled' ? 'bg-red-500 text-white' : 'bg-zinc-900 text-white'}`}>
            {statusType.toUpperCase()}
          </span>
          {order.tracking_number && <span className="text-[8px] font-black bg-blue-100 text-blue-600 px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1"><Truck size={10}/> Shipped</span>}
        </div>
        
        <h2 className="font-black text-2xl uppercase italic tracking-tight">{order.customer_name}</h2>
        
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => { setSelectedOrder(order); setActiveTab('slip'); setTrackingNum(order.tracking_number || ''); }} 
            className="flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-blue-100 border-none cursor-pointer italic"
          >
            <Eye size={12} /> View Order
          </button>

          {statusType === 'completed' && (
            <button 
              onClick={() => { setTrackingOrder(order); setTrackingNum(order.tracking_number || ''); }} 
              className="flex items-center gap-2 bg-blue-50 text-blue-600 border border-blue-200 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all cursor-pointer italic"
            >
              <Plus size={12} /> {order.tracking_number ? 'Edit Tracking' : 'Add Tracking ID'}
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center lg:items-end justify-between self-stretch gap-6 min-w-[200px]">
        <div className="text-right">
          <p className="text-[9px] font-black text-zinc-300 uppercase tracking-[0.3em] mb-1">Grand Total</p>
          <p className="text-4xl font-black italic tracking-tighter text-zinc-900">฿{order.total_price?.toLocaleString()}</p>
        </div>
        {statusType === 'pending' && (
          <div className="flex gap-3 w-full">
            <button onClick={() => handleCancelOrder(order.id)} className="flex-1 bg-white border border-zinc-200 text-zinc-400 px-6 py-4 rounded-full font-black text-[9px] uppercase tracking-widest hover:text-red-400 border-none cursor-pointer">Cancel</button>
            <button onClick={() => handleMarkAsSold(order.id, order.items)} className="flex-[1.5] bg-black text-white px-8 py-4 rounded-full font-black text-[9px] uppercase tracking-widest hover:bg-zinc-800 shadow-xl flex items-center justify-center gap-2 border-none cursor-pointer">Confirm <CheckCircle size={14} /></button>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-12 font-sans bg-white min-h-screen text-zinc-900">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-zinc-400 mb-12 font-black text-[10px] tracking-widest hover:text-black transition-colors uppercase italic border-none bg-transparent cursor-pointer"><ArrowLeft size={16} /> Go Back</button>
      
      <div className="mb-24">
        <h1 className="text-6xl font-black uppercase italic tracking-tighter border-b border-zinc-100 pb-8 mb-10 text-zinc-900">Pending <span className="text-zinc-100 ml-4">{pendingOrders.length}</span></h1>
        <div className="grid gap-8">{pendingOrders.map(o => <OrderCard key={o.id} order={o} statusType="pending" />)}</div>
      </div>

      <div className="mb-24">
        <h1 className="text-6xl font-black uppercase italic tracking-tighter border-b border-zinc-100 pb-8 mb-10 text-zinc-400/50">Confirmed <span className="text-zinc-50 ml-4">{confirmedOrders.length}</span></h1>
        <div className="grid gap-8">{confirmedOrders.map(o => <OrderCard key={o.id} order={o} statusType="completed" />)}</div>
      </div>

      <div className="mb-24">
        <h1 className="text-6xl font-black uppercase italic tracking-tighter border-b border-zinc-100 pb-8 mb-10 text-red-200">Canceled <span className="text-red-50 ml-4">{canceledOrders.length}</span></h1>
        <div className="grid gap-8">{canceledOrders.map(o => <OrderCard key={o.id} order={o} statusType="canceled" />)}</div>
      </div>

      {/* 🌟 Pop-up เฉพาะสำหรับกรอก Tracking ID (Quick Edit) */}
      {trackingOrder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md p-10 rounded-[40px] shadow-2xl relative border border-zinc-100">
            <button onClick={() => setTrackingOrder(null)} className="absolute top-6 right-6 text-zinc-300 hover:text-black transition-colors border-none bg-transparent cursor-pointer"><X size={24} /></button>
            <div className="mb-8">
              <span className="text-[8px] font-black text-blue-500 uppercase tracking-[0.3em] italic mb-2 block">Vault Dispatch Terminal</span>
              <h2 className="text-3xl font-black uppercase italic tracking-tighter text-zinc-900">Update Tracking</h2>
              <p className="text-[10px] font-bold text-zinc-400 mt-1 uppercase tracking-widest italic">For: {trackingOrder.customer_name}</p>
            </div>
            <div className="space-y-6">
              <div className="bg-zinc-50 p-6 rounded-[24px] border border-zinc-100">
                <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-3 block">Courier Tracking Number</label>
                <input autoFocus type="text" placeholder="ENTER ID (e.g. TH12345)" className="w-full bg-transparent border-none outline-none font-black italic text-xl text-zinc-900 placeholder:text-zinc-200" value={trackingNum} onChange={(e) => setTrackingNum(e.target.value.toUpperCase())} />
              </div>
              <button onClick={() => handleUpdateTracking(trackingOrder.id)} className="w-full py-5 rounded-full bg-blue-500 text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:bg-blue-600 transition-all active:scale-95 flex items-center justify-center gap-3 italic border-none cursor-pointer"><Save size={14} /> Update Dispatch Info</button>
            </div>
          </div>
        </div>
      )}

      {/* Pop-up รายละเอียด View Order (ยังคงช่องกรอกเลขพัสดุไว้) */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-[48px] shadow-2xl relative flex flex-col md:flex-row text-zinc-900">
            <button onClick={() => setSelectedOrder(null)} className="absolute top-8 right-8 z-10 text-zinc-400 hover:text-black border-none bg-transparent cursor-pointer"><X size={32} /></button>
            <div className="w-full md:w-1/2 bg-zinc-50 p-8 flex flex-col gap-6">
              <div className="aspect-[3/4] rounded-[32px] overflow-hidden border border-zinc-100 bg-white shadow-inner">
                {activeTab === 'slip' ? <img src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/slips/${selectedOrder.slip_url}`} className="w-full h-full object-cover" /> : <img src={selectedOrder.items[activeTab as number]?.image_url?.[0] || selectedOrder.items[activeTab as number]?.image_url} className="w-full h-full object-cover" />}
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                <button onClick={() => setActiveTab('slip')} className={`shrink-0 w-20 h-24 rounded-2xl overflow-hidden border-2 transition-all ${activeTab === 'slip' ? 'border-black' : 'opacity-40'}`}>
                  <div className="w-full h-full bg-zinc-200 relative"><div className="absolute inset-0 flex items-center justify-center font-black text-[8px]">SLIP</div></div>
                </button>
                {selectedOrder.items?.map((item: any, i: number) => (<button key={i} onClick={() => setActiveTab(i)} className={`shrink-0 w-20 h-24 rounded-2xl overflow-hidden border-2 transition-all ${activeTab === i ? 'border-black' : 'opacity-40'}`}><img src={item.image_url?.[0] || item.image_url} className="w-full h-full object-cover" /></button>))}
              </div>
            </div>

            <div className="w-full md:w-1/2 p-10 md:p-14 overflow-y-auto space-y-10">
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-300 mb-2">Customer Info</h3>
                <h2 className="text-5xl font-black uppercase italic tracking-tighter leading-none">{selectedOrder.customer_name}</h2>
                <p className="text-2xl font-black text-blue-600 italic mt-2">{selectedOrder.phone || 'N/A'}</p>
                <div className="mt-6 bg-zinc-50 p-6 rounded-[24px] border border-zinc-100 font-bold text-zinc-600 italic break-words">{selectedOrder.address}</div>
              </div>

              {/* 🌟 ช่องกรอกเลขพัสดุในหน้า View Details (คงไว้ตามต้องการ) */}
              <div className="space-y-4 pt-6 border-t border-zinc-100">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 italic">Dispatch Tracking ID</label>
                <div className="flex gap-2">
                  <input type="text" placeholder="ENTER TRACKING ID..." className="flex-1 p-5 bg-zinc-50 rounded-2xl border-none outline-none font-black italic text-sm focus:ring-2 focus:ring-black" value={trackingNum} onChange={(e) => setTrackingNum(e.target.value.toUpperCase())} />
                  {selectedOrder.status === 'completed' && (
                    <button onClick={() => handleUpdateTracking(selectedOrder.id)} className="bg-blue-600 text-white px-8 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-blue-700 transition-all border-none cursor-pointer italic">Update</button>
                  )}
                </div>
              </div>

              <div className="mt-8 flex justify-between items-end border-t border-zinc-50 pt-8">
                <span className="font-black text-zinc-300 uppercase italic">Grand Total</span>
                <span className="text-5xl font-black italic tracking-tighter text-zinc-900">฿{selectedOrder.total_price?.toLocaleString()}</span>
              </div>

              {selectedOrder.status === 'pending' && (
                <div className="flex gap-4 pt-4">
                  <button onClick={() => handleCancelOrder(selectedOrder.id)} className="flex-1 py-5 rounded-full border border-zinc-200 font-black text-[10px] uppercase text-zinc-400 border-none cursor-pointer">Cancel Order</button>
                  <button onClick={() => handleMarkAsSold(selectedOrder.id, selectedOrder.items)} className="flex-[2] py-5 rounded-full bg-black text-white font-black text-[10px] uppercase shadow-2xl hover:bg-zinc-800 border-none cursor-pointer italic">Confirm Order</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {loading && <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-[100]"><Loader2 className="animate-spin text-zinc-200" size={48} /></div>}
    </div>
  )
}