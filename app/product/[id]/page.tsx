'use client'
import { useState, useEffect, use } from 'react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'
import { useCart } from '../../context/CartContext' // 1. นำเข้า Hook ตะกร้า
import { ShoppingBag } from 'lucide-react'

export default function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { addToCart } = useCart() // 2. เรียกใช้ฟังก์ชัน addToCart
  
  const [product, setProduct] = useState<any>(null)
  const [mainImage, setMainImage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data, error: dbError } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single()

        if (dbError) throw dbError
        if (data) {
          setProduct(data)
          const images = Array.isArray(data.image_url) ? data.image_url : [data.image_url]
          setMainImage(images[0])
        } else {
          setError("ไม่พบสินค้าชิ้นนี้")
        }
      } catch (err: any) {
        console.error("Fetch Error:", err)
        setError(err.message)
      }
    }
    fetchProduct()
  }, [id])

  // 3. ฟังก์ชันจัดการเมื่อกดปุ่ม Add to Cart
  const handleAddToCart = () => {
    if (!product) return
    
    setIsAdding(true)
    
    // เพิ่มสินค้าลงใน Context
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      size: product.size
    })

    // หน่วงเวลาเพื่อสร้างความรู้สึก Interactive
    setTimeout(() => {
      setIsAdding(false)
      alert(`เพิ่ม ${product.name} ลงตะกร้าแล้ว!`)
    }, 400)
  }

  if (error) return <div className="p-20 text-center text-red-500 font-bold uppercase">Error: {error}</div>
  if (!product) return <div className="p-20 text-center font-bold animate-pulse">LOADING...</div>

  const images = Array.isArray(product.image_url) ? product.image_url : [product.image_url]

  return (
    <div className="max-w-6xl mx-auto p-6 font-sans">
      <Link href="/" className="text-gray-400 hover:text-black mb-8 inline-block transition font-bold text-xs tracking-widest no-underline">
        ← BACK TO SHOP
      </Link>
      
      <div className="grid md:grid-cols-2 gap-16">
        {/* ส่วนรูปภาพสินค้า (อ้างอิงดีไซน์จาก image_cc409f.jpg) */}
        <div className="space-y-4">
          <div className="aspect-square rounded-[40px] overflow-hidden bg-white border border-gray-100 shadow-xl">
            <img src={mainImage} className="w-full h-full object-cover" alt={product.name} />
          </div>
          {/* Thumbnails */}
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
            {images.map((img: string, i: number) => (
              <button 
                key={i} 
                onClick={() => setMainImage(img)}
                className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${mainImage === img ? 'border-black scale-95' : 'border-transparent opacity-60'}`}
              >
                <img src={img} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* ข้อมูลสินค้า (อ้างอิงดีไซน์จาก image_cdbba9.jpg) */}
        <div className="py-4 flex flex-col justify-center">
          <span className="text-gray-400 text-[10px] font-black tracking-[0.3em] uppercase mb-2">
            {product.category || 'VINTAGE'}
          </span>
          <h1 className="text-5xl font-black mb-4 uppercase leading-none tracking-tighter italic">
            {product.name}
          </h1>
          <p className="text-4xl text-blue-600 font-black mb-8 italic">
            ฿{product.price?.toLocaleString()}
          </p>
          
          <div className="space-y-8 border-t pt-8">
            <div className="flex items-center gap-4">
              <span className="font-black text-xs text-gray-400 uppercase tracking-widest">Size:</span>
              <span className="bg-gray-100 px-5 py-1.5 rounded-full font-black text-sm uppercase italic">
                {product.size}
              </span>
            </div>
            
            <p className="text-gray-500 leading-relaxed text-sm min-h-[100px]">
              {product.description || 'สวยยยยยย'}
            </p>

            {/* 4. ปุ่ม ADD TO CART ที่แก้ไขให้ทำงานได้จริง */}
            <button 
              onClick={handleAddToCart}
              disabled={isAdding}
              className={`w-full py-6 rounded-3xl font-black text-xs tracking-[0.3em] uppercase flex items-center justify-center gap-3 transition-all active:scale-95 shadow-2xl ${
                isAdding ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed' : 'bg-black text-white hover:bg-zinc-800'
              }`}
            >
              <ShoppingBag size={18} strokeWidth={2.5} />
              {isAdding ? 'ADDING...' : 'ADD TO CART'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}