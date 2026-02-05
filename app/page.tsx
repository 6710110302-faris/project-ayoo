'use client'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase' 
import Link from 'next/link'

export default function Home() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('id', { ascending: false })
        
        if (error) throw error
        if (data) setProducts(data)
      } catch (err) {
        console.error("Error fetching:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  if (loading) return <div className="p-20 text-center font-bold uppercase tracking-widest animate-pulse">Loading Collection...</div>

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* ลบส่วน Header (Title และปุ่ม SELL) ออกแล้ว 
         เพื่อให้ใช้ร่วมกับ Navbar ที่มีชื่อร้านอยู่แล้วได้สวยงาม 
      */}
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-4">
        {products.map((item) => {
          const displayImage = Array.isArray(item.image_url) ? item.image_url[0] : item.image_url

          return (
            <Link href={`/product/${item.id}`} key={item.id} className="group no-underline">
              <div className="aspect-[3/4] rounded-3xl overflow-hidden bg-gray-50 mb-4 border border-gray-100 shadow-sm transition-all duration-500 group-hover:shadow-xl">
                <img 
                  src={displayImage} 
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-700 ease-in-out"
                  onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/400x500?text=No+Image')}
                />
              </div>
              <div className="px-1">
                <h3 className="font-black text-[11px] tracking-wider text-gray-400 uppercase mb-1">{item.category || 'VINTAGE'}</h3>
                <h2 className="font-bold text-sm truncate uppercase text-black mb-1 leading-tight">{item.name}</h2>
                <p className="text-black font-black text-lg italic">฿{item.price?.toLocaleString()}</p>
              </div>
            </Link>
          )
        })}
      </div>

      {products.length === 0 && (
        <div className="text-center py-40 border-2 border-dashed border-gray-100 rounded-[40px]">
          <p className="text-gray-300 font-black italic uppercase tracking-widest text-2xl">Coming Soon</p>
        </div>
      )}
    </div>
  )
}