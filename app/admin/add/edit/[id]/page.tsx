'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../../lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Trash2, Edit3, Plus, Package } from 'lucide-react'

export default function AdminDashboard() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAdminAndFetch = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      // ถ้าไม่ใช่ admin ให้เด้งออกไปหน้าแรก
      if (user?.user_metadata?.role !== 'admin') {
        router.push('/')
        return
      }
      
      // ดึงข้อมูลสินค้า
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

  if (loading) return <div className="p-20 text-center font-black animate-pulse">LOADING DASHBOARD...</div>

  return (
    <div className="max-w-6xl mx-auto p-8 font-sans">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-black italic uppercase leading-none">Management</h1>
          <p className="text-gray-400 font-bold text-[10px] tracking-[0.3em] mt-2">STOCK CONTROL SYSTEM</p>
        </div>
        <Link 
          href="/admin/add" 
          className="bg-black text-white px-6 py-3 rounded-2xl font-black text-xs flex items-center gap-2 hover:bg-gray-800 transition shadow-lg active:scale-95"
        >
          <Plus size={16} /> ADD PRODUCT
        </Link>
      </div>

      <div className="bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50/50 text-[10px] font-black tracking-widest uppercase text-gray-400 border-b border-gray-50">
            <tr>
              <th className="px-8 py-5">Product Details</th>
              <th className="px-8 py-5">Price</th>
              <th className="px-8 py-5 text-right">Settings</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50/30 transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 overflow-hidden border border-gray-50">
                      <img 
                        src={Array.isArray(product.image_url) ? product.image_url[0] : product.image_url} 
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                        alt=""
                      />
                    </div>
                    <div>
                      <p className="font-black text-sm uppercase leading-tight">{product.name}</p>
                      <p className="text-[10px] font-bold text-gray-400 mt-1">SIZE: {product.size}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className="font-black text-sm italic">฿{product.price?.toLocaleString()}</span>
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => router.push(`/admin/edit/${product.id}`)}
                      className="p-3 text-gray-300 hover:text-black hover:bg-white rounded-xl transition shadow-sm border border-transparent hover:border-gray-100"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(product.id)}
                      className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition border border-transparent hover:border-red-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {products.length === 0 && (
          <div className="p-20 text-center">
            <Package className="mx-auto text-gray-200 mb-4" size={48} />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No products found in database</p>
          </div>
        )}
      </div>
    </div>
  )
}