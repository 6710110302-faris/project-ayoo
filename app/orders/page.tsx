'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Link from 'next/link'
import { ChevronLeft, Package, Clock, CheckCircle2, ExternalLink, AlertCircle, X, Eye, XCircle, Phone, Truck, Copy } from 'lucide-react'

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'slip' | number>('slip')

  useEffect(() => {
    const fetchOrders = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }
      setUser(user)

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (!error && data) setOrders(data)
      setLoading(false)
    }
    fetchOrders()
  }, [])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied Tracking ID: ' + text)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9F9F9]">
      <div className="text-center font-black animate-pulse tracking-[0.4em] text-zinc-300 text-[10px] uppercase">Retrieving Vault...</div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-12 font-sans bg-[#F9F9F9] min-h-screen text-zinc-900">
      <div className="mb-16">
        <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-black mb-8 font-black text-[10px] tracking-[0.2em] uppercase no-underline transition-colors italic border-none bg-transparent cursor-pointer">
          <ChevronLeft size={14} /> Back to Shop
        </Link>
        <h1 className="text-7xl font-black uppercase italic tracking-tighter leading-none text-zinc-900">Orders</h1>
        <p className="text-[10px] font-bold text-zinc-400 mt-4 uppercase tracking-[0.4em]">Vault Transaction History</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white p-24 rounded-[60px] text-center border border-zinc-50 shadow-sm">
          <Package size={64} className="mx-auto text-zinc-100 mb-8" />
          <p className="font-black text-zinc-300 uppercase tracking-widest text-[11px] italic">No archived transactions found.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-[48px] border border-zinc-50 shadow-sm overflow-hidden">
              <div className="p-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[9px] font-black text-zinc-300 uppercase tracking-widest italic">Reference</span>
                      <span className="bg-zinc-100 text-zinc-500 px-3 py-1 rounded-full text-[9px] font-mono font-bold italic">
                        #{String(order.id).padStart(5, '0')}
                      </span>
                    </div>
                    <p className="text-[11px] font-black text-zinc-900 uppercase italic tracking-wider">
                      Ordered on {new Date(order.created_at).toLocaleDateString('en-GB')}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    {/* 🌟 ปุ่มสถานะ DISPATCHED กับ CONFIRMED */}
                    <div className="flex items-center gap-3">
                      {order.tracking_number && (
                        <div className="bg-red-500 text-white px-6 py-2.5 rounded-full flex items-center gap-2 shadow-lg shadow-red-100 italic transition-all">
                          <Truck size={14} />
                          <span className="font-black text-[9px] uppercase tracking-[0.1em]">Item Dispatched</span>
                        </div>
                      )}
                      
                      <div className={`px-8 py-2.5 rounded-full flex items-center gap-3 italic transition-all ${
                        order.status === 'completed' ? 'bg-green-500 text-white shadow-lg shadow-green-100 scale-105' :
                        order.status === 'canceled' ? 'bg-red-500 text-white' : 'bg-white border-2 border-zinc-100 text-zinc-400'
                      }`}>
                        {order.status === 'completed' ? <CheckCircle2 size={16} /> : 
                         order.status === 'canceled' ? <XCircle size={16} /> : <Clock size={16} className="animate-spin-slow" />}
                        <span className="font-black text-[10px] uppercase tracking-[0.2em]">
                          {order.status === 'completed' ? 'Confirmed' : order.status === 'canceled' ? 'Canceled' : 'Pending Review'}
                        </span>
                      </div>
                    </div>

                    {/* 🌟 กล่อง Tracking ID: ความยาวเท่ากับปุ่มด้านบนรวมกัน */}
                    {order.tracking_number && (
                      <div className="w-full bg-zinc-900 text-white px-6 py-4 rounded-[28px] flex items-center justify-between shadow-2xl animate-in fade-in slide-in-from-top-2 duration-500">
                        <div className="flex flex-col">
                          <span className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-1">TRACKING ID</span>
                          <span className="text-xl font-black italic tracking-tighter leading-none">{order.tracking_number}</span>
                        </div>
                        <button 
                          onClick={() => copyToClipboard(order.tracking_number)}
                          className="flex items-center gap-2 hover:bg-white/10 p-2 rounded-xl transition-all border-none bg-transparent text-zinc-400 hover:text-white cursor-pointer group"
                        >
                          <span className="text-[8px] font-black uppercase tracking-widest hidden group-hover:inline animate-in fade-in">COPY</span>
                          <Copy size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 border-t border-zinc-50 pt-10">
                  {order.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between bg-zinc-50/50 p-6 rounded-[36px] pr-10 hover:bg-zinc-50 transition-colors">
                      <div className="flex items-center gap-8">
                        {/* 🌟 รูปสินค้าขนาดใหญ่เท่าเดิม */}
                        <div className="w-24 h-28 rounded-[24px] overflow-hidden bg-white border border-zinc-100 shadow-sm shrink-0">
                          <img src={Array.isArray(item.image_url) ? item.image_url[0] : item.image_url} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div>
                          <p className="text-lg font-black uppercase italic text-zinc-900 tracking-tight leading-tight mb-2">{item.name}</p>
                          <span className="text-[10px] font-black bg-zinc-900 text-white px-4 py-1.5 rounded-xl uppercase tracking-widest italic">{item.size}</span>
                        </div>
                      </div>
                      <p className="font-black italic text-zinc-900 text-2xl tracking-tighter italic">฿{item.price?.toLocaleString()}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-10 pt-10 border-t border-zinc-50 flex flex-col md:flex-row justify-between items-center md:items-end gap-6">
                  <div>
                    <p className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.3em] mb-2 italic">Grand Total</p>
                    <p className="text-6xl font-black italic tracking-tighter text-zinc-900 leading-none">
                       ฿{(order.total_price || order.total_amount)?.toLocaleString()}
                    </p>
                  </div>
                  <button 
                    onClick={() => { setSelectedOrder(order); setActiveTab('slip'); }}
                    className="w-full md:w-auto px-12 py-6 rounded-[28px] font-black text-[11px] tracking-[0.3em] uppercase flex items-center justify-center gap-3 transition-all shadow-xl active:scale-95 italic border-none cursor-pointer bg-zinc-900 text-white hover:bg-black"
                  >
                    View Details <ExternalLink size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Detail ยังคงเดิมเพื่อความสมบูรณ์ */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-[48px] shadow-2xl relative flex flex-col md:flex-row">
            <button onClick={() => setSelectedOrder(null)} className="absolute top-8 right-8 z-10 text-zinc-400 hover:text-black border-none bg-transparent cursor-pointer"><X size={32} /></button>
            <div className="w-full md:w-1/2 bg-zinc-50 p-8 flex flex-col gap-6">
              <div className="aspect-[3/4] rounded-[32px] overflow-hidden border border-zinc-100 bg-white shadow-inner">
                {activeTab === 'slip' ? <img src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/slips/${selectedOrder.slip_url}`} className="w-full h-full object-cover" /> : <img src={selectedOrder.items[activeTab as number]?.image_url?.[0] || selectedOrder.items[activeTab as number]?.image_url} className="w-full h-full object-cover" />}
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2">
                <button onClick={() => setActiveTab('slip')} className={`shrink-0 w-20 h-24 rounded-2xl overflow-hidden border-2 transition-all ${activeTab === 'slip' ? 'border-black' : 'opacity-40'}`}><div className="w-full h-full bg-zinc-200 relative"><div className="absolute inset-0 flex items-center justify-center font-black text-[8px] text-zinc-900">SLIP</div></div></button>
                {selectedOrder.items?.map((item: any, i: number) => (<button key={i} onClick={() => setActiveTab(i)} className={`shrink-0 w-20 h-24 rounded-2xl overflow-hidden border-2 transition-all ${activeTab === i ? 'border-black' : 'opacity-40'}`}><img src={item.image_url?.[0] || item.image_url} className="w-full h-full object-cover" /></button>))}
              </div>
            </div>
            <div className="w-full md:w-1/2 p-10 md:p-14 overflow-y-auto space-y-10">
              <div><h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-300 mb-2 italic">Shipment To</h3><h2 className="text-5xl font-black uppercase italic tracking-tighter leading-none">{selectedOrder.customer_name}</h2><div className="flex items-center gap-2 mt-2 text-blue-600"><Phone size={14} /><p className="text-xl font-black italic tracking-tight">{selectedOrder.phone}</p></div><div className="mt-6 bg-zinc-50 p-6 rounded-[24px] border border-zinc-100 font-bold text-zinc-600 leading-relaxed italic">{selectedOrder.address}</div></div>
              {selectedOrder.tracking_number && (<div className="bg-zinc-900 text-white p-8 rounded-[36px]"><div className="flex justify-between items-center mb-4"><span className="text-[9px] font-black text-zinc-500 uppercase">Vault Dispatch Log</span><span className="bg-green-500 text-white text-[7px] px-3 py-1 rounded-full font-black uppercase tracking-widest italic animate-pulse">SHIPPED</span></div><div className="flex justify-between items-end"><div><p className="text-[10px] font-bold text-zinc-400 mb-1 uppercase tracking-widest">Tracking ID</p><p className="text-4xl font-black italic tracking-tighter leading-none">{selectedOrder.tracking_number}</p></div><button onClick={() => copyToClipboard(selectedOrder.tracking_number)} className="text-[9px] font-black underline decoration-zinc-700 text-zinc-400 border-none bg-transparent cursor-pointer">Copy</button></div></div>)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}