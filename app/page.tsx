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
          // เรียงตาม ID เป็นหลักเพื่อให้ของใหม่ขึ้นก่อน
          .order('id', { ascending: false })
        
        if (error) throw error
        if (data) {
          // 🌟 Logic: แยกสินค้าที่ยังไม่ขาย และขายแล้วออกจากกัน แล้วนำมาต่อกัน
          // เพื่อให้สินค้า is_sold: true ไปอยู่ท้ายสุดเสมอ
          const available = data.filter(item => !item.is_sold)
          const soldOut = data.filter(item => item.is_sold)
          setProducts([...available, ...soldOut])
        }
      } catch (err) {
        console.error("Error fetching:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center font-black text-xs tracking-[0.5em] text-zinc-300 animate-pulse uppercase">
      Scanning Collection...
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-12 font-sans bg-white min-h-screen">
      {/* Title Decoration */}
      <div className="mb-12 border-b border-zinc-50 pb-8">
        <h1 className="text-4xl font-black uppercase italic tracking-tighter text-zinc-900">New Arrivals</h1>
        <p className="text-[9px] font-black text-zinc-300 mt-2 uppercase tracking-[0.4em]">Vault Collection</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
        {products.map((item) => {
          const displayImage = Array.isArray(item.image_url) ? item.image_url[0] : item.image_url

          return (
            <Link href={`/product/${item.id}`} key={item.id} className="group no-underline block">
              {/* Product Visual */}
              <div className={`aspect-[3/4] rounded-[40px] overflow-hidden bg-zinc-50 mb-6 border border-zinc-50 shadow-sm transition-all duration-700 group-hover:shadow-2xl group-hover:border-zinc-200 relative ${item.is_sold ? 'opacity-80' : ''}`}>
                <img 
                  src={displayImage} 
                  className={`w-full h-full object-cover group-hover:scale-110 transition duration-1000 ease-in-out ${item.is_sold ? 'grayscale' : ''}`}
                  alt={item.name}
                  onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/400x500?text=No+Image')}
                />
                
                {/* 🌟 ป้ายสถานะ: เปลี่ยนตามค่า is_sold */}
                <div className="absolute top-4 right-4 z-10">
                  <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase shadow-sm tracking-tighter ${
                    item.is_sold 
                    ? 'bg-zinc-900 text-white' // ป้าย Out Stock สีดำ
                    : 'bg-white/90 text-zinc-900' // ป้าย In Stock สีขาว
                  }`}>
                    {item.is_sold ? 'Out of Stock' : 'In Stock'}
                  </span>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>

              {/* Product Info */}
              <div className="px-2">
                <div className="flex justify-between items-center mb-2">
                  <h3 className={`font-black text-[9px] tracking-[0.2em] uppercase italic ${item.is_sold ? 'text-zinc-200' : 'text-zinc-300'}`}>
                    {item.category || 'VAULT ITEM'}
                  </h3>
                </div>

                <h2 className={`font-black text-lg uppercase tracking-tight leading-none group-hover:underline underline-offset-4 decoration-2 ${item.is_sold ? 'text-zinc-300' : 'text-zinc-900'}`}>
                  {item.name}
                </h2>
                
                <p className={`font-black text-xl tracking-tighter mt-3 ${item.is_sold ? 'text-zinc-200 line-through' : 'text-zinc-900'}`}>
                  ฿ {item.price?.toLocaleString()}
                </p>
              </div>
            </Link>
          )
        })}
      </div>

      {products.length === 0 && (
        <div className="text-center py-40 bg-zinc-50 rounded-[60px] border border-dashed border-zinc-100">
          <p className="text-zinc-200 font-black italic uppercase tracking-[0.3em] text-xl">Coming Soon to Vault</p>
        </div>
      )}
    </div>
  )
}