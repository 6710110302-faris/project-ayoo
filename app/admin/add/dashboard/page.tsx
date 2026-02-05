'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Trash2, Edit3, Plus, Package, ShoppingBag, ArrowRight } from 'lucide-react'

export default function AdminDashboard() {
  const [products, setProducts] = useState<any[]>([])
  const [orderCount, setOrderCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAdminAndFetch = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.user_metadata?.role !== 'admin') {
        router.push('/')
        return
      }

      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: false })
      
      const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })

      if (productsData) setProducts(productsData)
      if (count !== null) setOrderCount(count)
      setLoading(false)
    }
    checkAdminAndFetch()
  }, [router])

  const handleDelete = async (id: string) => {
    if (confirm('Confirm deletion?')) {
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (!error) {
        setProducts(products.filter(p => p.id !== id))
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
            className="bg-zinc-900 text-white px-6 py-3 rounded-[20px] font-black text-[10px] tracking-widest flex items-center gap-2 hover:bg-black transition-all shadow-lg shadow-zinc-200 active:scale-95 group"
          >
            <ShoppingBag size={14} />
            ORDERS
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

      {/* Stats Cards (ตรงตาม image_10e45a.png) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {/* Card: Stock */}
        <div className="p-10 bg-white rounded-[40px] border border-zinc-50 flex justify-between items-center shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)]">
          <div>
            <p className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.2em] mb-3">Items in Vault</p>
            <p className="text-6xl font-black italic tracking-tighter text-zinc-900">{products.length}</p>
          </div>
          <div className="w-16 h-16 bg-[#F9F9F9] rounded-2xl flex items-center justify-center border border-zinc-50">
            <Package size={24} className="text-zinc-900" />
          </div>
        </div>

        {/* Card: Orders */}
          <div className="p-10 bg-white rounded-[40px] border border-zinc-50 flex justify-between items-center shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] group-hover:border-zinc-200 transition-all">
            <div>
              <p className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.2em] mb-3">Total Orders</p>
              <p className="text-6xl font-black italic tracking-tighter text-zinc-900">{orderCount}</p>
            </div>
          </div>
        
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-[48px] overflow-hidden shadow-[0_20px_60px_-20px_rgba(0,0,0,0.05)] border border-zinc-50">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#FDFFFD] text-[9px] font-black tracking-[0.25em] uppercase text-zinc-300 border-b border-zinc-50">
            <tr>
              <th className="px-10 py-8">Product Details</th>
              <th className="px-10 py-8">Pricing</th>
              <th className="px-10 py-8 text-right">Edit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {products.map((product) => (
              <tr key={product.id} className="group hover:bg-zinc-50/30 transition-colors">
                <td className="px-10 py-8">
                  <div className="flex items-center gap-8">
                    <div className="w-24 h-24 rounded-[30px] bg-[#F9F9F9] overflow-hidden border border-zinc-100 shadow-inner">
                      <img 
                        src={Array.isArray(product.image_url) ? product.image_url[0] : product.image_url} 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                        alt=""
                      />
                    </div>
                    <div>
                      <p className="font-black text-lg uppercase tracking-tight text-zinc-900 leading-tight">{product.name}</p>
                      <div className="flex gap-2 mt-3">
                         <span className="text-[8px] font-black bg-white border border-zinc-100 px-3 py-1 rounded-full text-zinc-400 uppercase tracking-widest">{product.size}</span>
                         {product.category && <span className="text-[8px] font-white bg-zinc-900 px-3 py-1 rounded-full text-white uppercase tracking-widest">{product.category}</span>}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-10 py-8">
                  <div className="flex flex-col">
                    <span className="font-black text-2xl italic tracking-tighter text-zinc-900">฿{product.price?.toLocaleString()}</span>
                    <span className="text-[8px] font-black text-zinc-200 uppercase tracking-widest mt-1 text-zinc-300">Retail Value</span>
                  </div>
                </td>
                <td className="px-10 py-8 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => router.push(`/admin/add/edit/${product.id}`)}
                      className="w-12 h-12 flex items-center justify-center text-zinc-300 hover:text-zinc-900 hover:bg-white rounded-2xl transition-all border border-transparent hover:border-zinc-100"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(product.id)}
                      className="w-12 h-12 flex items-center justify-center text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
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
          <div className="py-40 text-center">
            <div className="inline-block p-10 bg-[#F9F9F9] rounded-[40px] mb-6 border border-zinc-50">
               <Package className="text-zinc-200" size={48} />
            </div>
            <p className="text-zinc-300 font-black uppercase tracking-[0.4em] text-[9px]">The Vault is Empty</p>
          </div>
        )}
      </div>
    </div>
  )
}