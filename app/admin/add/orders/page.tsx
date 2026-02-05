'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { ChevronLeft, Eye, Trash2, CheckCircle, Clock } from 'lucide-react'
import Link from 'next/link'

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) setOrders(data)
    setLoading(false)
  }

  const updateStatus = async (id: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'pending' ? 'shipped' : 'pending'
    const { error } = await supabase
      .from('orders')
      .update({ status: nextStatus })
      .eq('id', id)
    
    if (!error) fetchOrders()
  }

  const deleteOrder = async (id: number) => {
    if (confirm('ยืนยันการลบออเดอร์นี้?')) {
      const { error } = await supabase.from('orders').delete().eq('id', id)
      if (!error) fetchOrders()
    }
  }

  const getSlipUrl = (path: string) => {
    const { data } = supabase.storage.from('slips').getPublicUrl(path)
    return data.publicUrl
  }

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-12 font-sans bg-white min-h-screen">
      <div className="flex justify-between items-center mb-10">
        <div>
          <Link href="/" className="text-gray-400 hover:text-black mb-4 inline-block font-black text-[10px] tracking-widest no-underline uppercase">
            ← Back to Store
          </Link>
          <h1 className="text-5xl font-black uppercase italic tracking-tighter">Order Management</h1>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center font-black animate-pulse text-gray-200 text-3xl italic">FETCHING...</div>
      ) : (
        <div className="grid gap-6">
          {orders.map((order) => (
            <div key={order.id} className="border border-zinc-100 rounded-[40px] p-8 flex flex-col lg:flex-row gap-10 hover:shadow-2xl transition-all duration-500 bg-zinc-50/30">
              
              {/* รายละเอียดลูกค้า & สินค้า */}
              <div className="flex-grow space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="font-black text-2xl uppercase italic leading-none">{order.customer_name}</h2>
                    <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest">
                      Ordered on {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    order.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'
                  }`}>
                    {order.status}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold uppercase italic text-gray-500">
                  <p>📞 {order.phone}</p>
                  <p>📍 {order.address}</p>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-zinc-100">
                  <div className="space-y-2">
                    {order.items?.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between text-[11px] font-black uppercase italic">
                        <span>{item.name} (Size {item.size})</span>
                        <span>฿{item.price?.toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2 mt-2 flex justify-between font-black text-lg text-black italic">
                      <span>TOTAL</span>
                      <span>฿{order.total_price?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* ปุ่ม Action */}
                <div className="flex gap-3">
                  <button 
                    onClick={() => updateStatus(order.id, order.status)}
                    className="flex-1 py-4 bg-black text-white rounded-2xl font-black text-[10px] tracking-widest uppercase hover:bg-zinc-800 transition shadow-lg flex items-center justify-center gap-2"
                  >
                    {order.status === 'pending' ? <CheckCircle size={14}/> : <Clock size={14}/>}
                    {order.status === 'pending' ? 'Mark as Shipped' : 'Back to Pending'}
                  </button>
                  <button 
                    onClick={() => deleteOrder(order.id)}
                    className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition shadow-sm"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              {/* รูปสลิป */}
              <div className="w-full lg:w-56 shrink-0">
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest block mb-3 pl-2">Transfer Slip</span>
                <div className="aspect-[3/4] bg-white rounded-[32px] overflow-hidden border border-zinc-200 relative group shadow-inner">
                  <img src={getSlipUrl(order.slip_url)} className="w-full h-full object-cover" alt="slip" />
                  <a href={getSlipUrl(order.slip_url)} target="_blank" className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white no-underline">
                    <Eye className="mr-2" size={18} /> <span className="font-black italic uppercase text-xs">View Full</span>
                  </a>
                </div>
              </div>

            </div>
          ))}
          
          {orders.length === 0 && (
            <div className="text-center py-40 border-4 border-dashed border-zinc-50 rounded-[60px]">
              <p className="font-black italic text-zinc-300 uppercase tracking-[0.3em]">No orders yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}