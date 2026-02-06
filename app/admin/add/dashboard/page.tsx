'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Trash2, Edit3, Plus, Package, ShoppingBag, CheckCircle, AlertCircle } from 'lucide-react' // 🌟 เพิ่ม AlertCircle

export default function AdminDashboard() {
  const [products, setProducts] = useState<any[]>([])
  const [orderCount, setOrderCount] = useState(0)
  const [pendingCount, setPendingCount] = useState(0) // 🌟 State สำหรับนับออเดอร์ค้างยืนยัน
  const [inStockCount, setInStockCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAdminAndFetch = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.user_metadata?.role !== 'admin') {
        router.push('/')
        return
      }

      await fetchData() // แยกฟังก์ชันออกมาเพื่อให้เรียกซ้ำได้
      setLoading(false)
    }

    // 🌟 ระบบ Real-time: ฟังการเปลี่ยนแปลงในตาราง orders
    const ordersSubscription = supabase
      .channel('admin-orders-check')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchData() // รีเฟรชข้อมูลเมื่อมีการเปลี่ยนแปลงในตาราง orders
      })
      .subscribe()

    checkAdminAndFetch()
    
    return () => {
      supabase.removeChannel(ordersSubscription)
    }
  }, [router])

  const fetchData = async () => {
    // 1. ดึงข้อมูลสินค้าพร้อมเรียงลำดับ
    const { data: productsData } = await supabase
      .from('products')
      .select('*')
      .order('is_sold', { ascending: true })
      .order('created_at', { ascending: false })
    
    // 2. นับจำนวนออเดอร์ทั้งหมด
    const { count: totalOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })

    // 🌟 3. นับจำนวนออเดอร์ที่มีสถานะ pending (เครื่องหมายตกใจจะอิงจากยอดนี้)
    const { count: pCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending') //

    // 4. นับจำนวนสินค้าที่ยังไม่ขาย
    const { count: stockCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_sold', false)

    if (productsData) setProducts(productsData)
    if (totalOrders !== null) setOrderCount(totalOrders)
    if (pCount !== null) setPendingCount(pCount)
    if (stockCount !== null) setInStockCount(stockCount)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Confirm deletion?')) {
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (!error) {
        setProducts(products.filter(p => p.id !== id))
        setInStockCount(prev => prev - 1)
      }
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9F9F9]">
      <div className="text-center font-black animate-pulse tracking-[0.4em] text-zinc-300 text-[10px]">ACCESSING VAULT...</div>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-12 font-sans bg-[#F9F9F9] min-h-screen text-zinc-900">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <h1 className="text-5xl font-black italic uppercase leading-none tracking-tighter text-zinc-900">Inventory</h1>
          <p className="text-[10px] font-bold text-zinc-400 mt-2 uppercase tracking-[0.2em]">Management Terminal</p>
        </div>
        <div className="flex gap-3">
           <Link 
            href="/admin/add/orders" 
            className="bg-zinc-900 text-white px-6 py-3 rounded-[20px] font-black text-[10px] tracking-widest flex items-center gap-2 hover:bg-black transition-all shadow-lg shadow-zinc-200 active:scale-95 group relative" // 🌟 เพิ่ม relative
          >
            <ShoppingBag size={14} />
            ORDERS
            
            {/* 🚩 เครื่องหมายแจ้งเตือนตกใจสีแดง (โชว์เมื่อมี pendingCount > 0) */}
            {pendingCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 items-center justify-center border-2 border-zinc-900">
                  <AlertCircle size={10} className="text-white fill-white" />
                </span>
              </span>
            )}
          </Link>

          <Link 
            href="/admin/add" 
            className="bg-zinc-900 text-white px-6 py-3 rounded-[20px] font-black text-[10px] tracking-widest flex items-center gap-2 hover:bg-black transition-all shadow-lg shadow-zinc-200 active:scale-95 group"
          >
            <Plus size={14} /> 
            ADD PRODUCT
          </Link>
        </div>
      </div>

      {/* ... ส่วน Stats Cards และตารางเดิมของคุณ ... */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Items in Vault */}
        <div className="p-10 bg-white rounded-[40px] border border-zinc-50 flex justify-between items-center shadow-sm">
          <div>
            <p className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.2em] mb-3">Items in Vault</p>
            <p className="text-6xl font-black italic tracking-tighter text-zinc-900">{products.length}</p>
          </div>
          <div className="w-16 h-16 bg-[#F9F9F9] rounded-2xl flex items-center justify-center">
            <Package size={24} className="text-zinc-900" />
          </div>
        </div>

        {/* Total Orders */}
        <div className="p-10 bg-white rounded-[40px] border border-zinc-50 flex justify-between items-center shadow-sm">
          <div>
            <p className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.2em] mb-3">Total Orders</p>
            <p className="text-6xl font-black italic tracking-tighter text-zinc-900">{orderCount}</p>
          </div>
          <div className="w-16 h-16 bg-[#F9F9F9] rounded-2xl flex items-center justify-center">
            <ShoppingBag size={24} className="text-zinc-900" />
          </div>
        </div>

        {/* Items In Stock */}
        <div className="p-10 bg-white rounded-[40px] border border-zinc-50 flex justify-between items-center shadow-sm">
          <div>
            <p className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.2em] mb-3">Items In Stock</p>
            <p className="text-6xl font-black italic tracking-tighter text-zinc-900">{inStockCount}</p>
          </div>
          <div className="w-16 h-16 bg-[#F9F9F9] rounded-2xl flex items-center justify-center">
            <CheckCircle size={24} className="text-green-500" />
          </div>
        </div>
      </div>
      
      {/* ส่วนตารางสินค้าแสดงผลเหมือนเดิมครับ */}
      <div className="bg-white rounded-[48px] overflow-hidden shadow-sm border border-zinc-50">
        <table className="w-full text-left border-collapse">
          {/* ... โค้ด table เดิม ... */}
          <tbody className="divide-y divide-zinc-50">
            {products.map((product) => (
              <tr key={product.id} className={`group hover:bg-zinc-50/30 transition-colors ${product.is_sold ? 'opacity-60' : ''}`}>
                <td className="px-10 py-8">
                  <div className="flex items-center gap-8">
                    <div className="w-24 h-24 rounded-[30px] bg-[#F9F9F9] overflow-hidden border border-zinc-100 shadow-inner relative">
                      <img 
                        src={Array.isArray(product.image_url) ? product.image_url[0] : product.image_url} 
                        className={`w-full h-full object-cover group-hover:scale-105 transition duration-700 ${product.is_sold ? 'grayscale' : ''}`}
                        alt=""
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <p className={`font-black text-lg uppercase tracking-tight leading-tight ${product.is_sold ? 'text-zinc-400' : 'text-zinc-900'}`}>{product.name}</p>
                        {product.is_sold && (
                           <span className="text-[7px] font-black bg-red-500 text-white px-2 py-0.5 rounded-full uppercase italic">SOLD OUT</span>
                        )}
                      </div>
                      <div className="flex gap-2 mt-3">
                         <span className="text-[8px] font-black bg-white border border-zinc-100 px-3 py-1 rounded-full text-zinc-400 uppercase tracking-widest">{product.size}</span>
                         {product.category && <span className="text-[8px] font-black bg-zinc-900 px-3 py-1 rounded-full text-white uppercase tracking-widest">{product.category}</span>}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-10 py-8">
                  <div className="flex flex-col">
                    <span className={`font-black text-2xl italic tracking-tighter ${product.is_sold ? 'text-zinc-300 line-through' : 'text-zinc-900'}`}>฿{product.price?.toLocaleString()}</span>
                    <span className="text-[8px] font-black text-zinc-200 uppercase tracking-widest mt-1">Retail Value</span>
                  </div>
                </td>
                <td className="px-10 py-8 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => router.push(`/admin/add/edit/${product.id}`)} className="w-12 h-12 flex items-center justify-center text-zinc-300 hover:text-zinc-900 hover:bg-white rounded-2xl transition-all border border-transparent hover:border-zinc-100"><Edit3 size={18} /></button>
                    <button onClick={() => handleDelete(product.id)} className="w-12 h-12 flex items-center justify-center text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}