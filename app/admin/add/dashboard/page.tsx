'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Trash2, Edit3, Plus, Package, ExternalLink } from 'lucide-react'

export default function AdminDashboard() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAdminAndFetch = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.user_metadata?.role !== 'admin') {
        router.push('/')
        return
      }
      const { data } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: false })
      if (data) setProducts(data)
      setLoading(false)
    }
    checkAdminAndFetch()
  }, [router])

  const handleDelete = async (id: string) => {
    if (confirm('ยืนยันที่จะลบสินค้านี้ใช่ไหม?')) {
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (!error) {
        setProducts(products.filter(p => p.id !== id))
        alert('ลบสำเร็จ')
      }
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center font-black animate-pulse tracking-[0.5em] text-gray-400">LOADING...</div>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-12 font-sans bg-white">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <h1 className="text-5xl font-black italic uppercase leading-none tracking-tighter">Inventory</h1>
        </div>
        <Link 
          href="/admin/add" 
          className="bg-black text-white px-8 py-4 rounded-[22px] font-black text-xs flex items-center gap-3 hover:bg-zinc-800 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.15)] active:scale-95 group"
        >
          <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" /> 
          ADD NEW PRODUCT
        </Link>
      </div>

      {/* Stats Summary (Optional/New UI) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 text-center">
        <div className="p-6 bg-gray-50 rounded-[30px] border border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Stock</p>
          <p className="text-2xl font-black mt-1">{products.length} Items</p>
        </div>
        {/* คุณสามารถเพิ่มช่องอื่นๆ เช่น ยอดรวมราคาได้ที่นี่ */}
      </div>

      {/* Table Container */}
      <div className="bg-white border border-gray-100 rounded-[42px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.03)]">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50/80 text-[10px] font-black tracking-widest uppercase text-gray-500 border-b border-gray-50">
            <tr>
              <th className="px-10 py-6">Product Details</th>
              <th className="px-10 py-6">Pricing</th>
              <th className="px-10 py-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50/40 transition-all group">
                <td className="px-10 py-7">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-[28px] bg-gray-100 overflow-hidden border border-gray-100 shadow-sm relative">
                      <img 
                        src={Array.isArray(product.image_url) ? product.image_url[0] : product.image_url} 
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                        alt=""
                      />
                    </div>
                    <div>
                      <p className="font-black text-base uppercase leading-tight text-zinc-900">{product.name}</p>
                      <div className="flex gap-2 mt-2">
                         <span className="text-[9px] font-black bg-zinc-100 px-2 py-1 rounded-md text-zinc-500 uppercase tracking-tighter">SIZE: {product.size}</span>
                         {product.category && <span className="text-[9px] font-black bg-zinc-100 px-2 py-1 rounded-md text-zinc-500 uppercase tracking-tighter">{product.category}</span>}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-10 py-7">
                  <div className="flex flex-col">
                    <span className="font-black text-lg italic text-zinc-900 leading-none">฿{product.price?.toLocaleString()}</span>
                    <span className="text-[9px] font-bold text-gray-300 uppercase mt-1">Net Price</span>
                  </div>
                </td>
                <td className="px-10 py-7 text-right">
                  <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button 
                      onClick={() => router.push(`/admin/add/edit/${product.id}`)}
                      className="p-4 text-zinc-400 hover:text-black bg-white hover:bg-zinc-50 rounded-2xl transition shadow-sm border border-gray-100 active:scale-90"
                      title="Edit Product"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(product.id)}
                      className="p-4 text-zinc-400 hover:text-red-500 bg-white hover:bg-red-50 rounded-2xl transition border border-gray-100 active:scale-90"
                      title="Delete Product"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Empty State */}
        {products.length === 0 && (
          <div className="p-32 text-center bg-gray-50/30">
            <div className="inline-block p-8 bg-white rounded-[40px] shadow-sm mb-6 border border-gray-50">
               <Package className="text-zinc-200" size={60} />
            </div>
            <p className="text-zinc-400 font-black uppercase tracking-[0.3em] text-[10px]">No products in your vault</p>
          </div>
        )}
      </div>
    </div>
  )
}   