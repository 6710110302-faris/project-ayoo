'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '../lib/supabase'
import Link from 'next/link'
import { ShoppingBag, ArrowLeft } from 'lucide-react'

function ShopContent() {
  const searchParams = useSearchParams()
  
  const categoryFilter = searchParams.get('category') || ''
  const searchFilter = searchParams.get('search') || ''
  
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        let query = supabase.from('products').select('*')
        
        if (categoryFilter) {
          query = query.eq('category', categoryFilter)
        }
        
        if (searchFilter) {
          query = query.ilike('name', `%${searchFilter}%`) 
        }
        
        const { data, error } = await query.order('id', { ascending: false })
        
        if (error) throw error

        if (data) {
          // 🌟 Logic: แยกสินค้าที่ยังไม่ขาย และขายแล้วออกจากกัน เพื่อเอาของหมดไปไว้หลังสุด
          const available = data.filter(item => !item.is_sold)
          const soldOut = data.filter(item => item.is_sold)
          setProducts([...available, ...soldOut])
        }
      } catch (err) {
        console.error("Error fetching products:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [categoryFilter, searchFilter]) 

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-12 font-sans min-h-screen bg-white text-zinc-900">
      <div className="mb-12">
        <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-black mb-6 transition-all font-black text-[10px] tracking-[0.2em] uppercase no-underline">
          <ArrowLeft size={14} /> Back to Home
        </Link>
        
        <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none">
          {searchFilter ? `Search :  ${searchFilter}` : categoryFilter ? categoryFilter : 'The Vault'}
        </h1>
        <p className="text-[10px] font-black text-zinc-300 mt-4 uppercase tracking-[0.4em]">
          {products.length} Results Found
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center font-black animate-pulse text-zinc-200 tracking-[0.5em] text-xs uppercase">Searching Vault...</div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link key={product.id} href={`/product/${product.id}`} className="group no-underline block">
              <div className={`aspect-[3/4] rounded-[32px] overflow-hidden bg-zinc-50 border border-zinc-100 mb-4 relative transition-all duration-500 ${product.is_sold ? 'opacity-70' : ''}`}>
                <img 
                  src={Array.isArray(product.image_url) ? product.image_url[0] : product.image_url} 
                  className={`w-full h-full object-cover group-hover:scale-110 transition duration-700 ${product.is_sold ? 'grayscale' : ''}`}
                  alt={product.name}
                />
                
                {/* 🌟 ป้ายสถานะมุมขวาบน: เปลี่ยนตาม is_sold */}
                <div className="absolute top-4 right-4 z-10">
                  <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase shadow-sm tracking-tighter ${
                    product.is_sold 
                    ? 'bg-zinc-900 text-white' 
                    : 'bg-white/90 text-zinc-900'
                  }`}>
                    {product.is_sold ? 'Out of Stock' : 'In Stock'}
                  </span>
                </div>
              </div>

              <h3 className={`font-black text-sm uppercase group-hover:underline underline-offset-4 ${product.is_sold ? 'text-zinc-300' : 'text-zinc-900'}`}>
                {product.name}
              </h3>
              
              <p className={`font-black text-lg tracking-tighter mt-1 ${product.is_sold ? 'text-zinc-200 line-through' : 'text-zinc-900'}`}>
                ฿ {product.price?.toLocaleString()}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-40 text-center bg-zinc-50 rounded-[60px] border border-dashed border-zinc-200">
          <ShoppingBag className="mx-auto text-zinc-200 mb-4" size={48} />
          <p className="font-black italic text-zinc-300 uppercase tracking-[0.3em] text-[10px]">No items matching "{searchFilter}"</p>
          <Link href="/shop" className="mt-6 inline-block font-black text-[10px] tracking-widest text-zinc-900 underline uppercase">Clear Search</Link>
        </div>
      )}
    </div>
  )
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white"></div>}>
      <ShopContent />
    </Suspense>
  )
}