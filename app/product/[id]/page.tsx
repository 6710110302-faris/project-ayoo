'use client'
import { useState, useEffect, use } from 'react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'

export default function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [product, setProduct] = useState<any>(null)
  const [mainImage, setMainImage] = useState('')
  const [error, setError] = useState<string | null>(null)

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
          // ตั้งค่ารูปหลักรูปแรก
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

  if (error) return <div className="p-20 text-center text-red-500 font-bold">เกิดข้อผิดพลาด: {error}</div>
  if (!product) return <div className="p-20 text-center font-bold">กำลังดึงข้อมูลสินค้า...</div>

  const images = Array.isArray(product.image_url) ? product.image_url : [product.image_url]

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Link href="/" className="text-gray-400 hover:text-black mb-8 inline-block transition">← BACK TO SHOP</Link>
      
      <div className="grid md:grid-cols-2 gap-12">
        {/* ส่วนรูปภาพ */}
        <div className="space-y-4">
          <div className="aspect-square rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-md">
            <img src={mainImage} className="w-full h-full object-cover" />
          </div>
          {/* แถบรูปย่อ */}
          <div className="flex gap-3 overflow-x-auto pb-2">
            {images.map((img: string, i: number) => (
              <button 
                key={i} 
                onClick={() => setMainImage(img)}
                className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${mainImage === img ? 'border-black scale-95' : 'border-transparent opacity-60'}`}
              >
                <img src={img} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* ข้อมูลสินค้า */}
        <div className="py-4">
          <span className="text-gray-400 text-xs font-bold tracking-widest uppercase">{product.category || 'VINTAGE'}</span>
          <h1 className="text-5xl font-black mb-4 uppercase mt-2">{product.name}</h1>
          <p className="text-3xl text-blue-600 font-black mb-8">฿{product.price?.toLocaleString()}</p>
          
          <div className="space-y-6 border-t pt-8">
            <div className="flex items-center gap-4">
              <span className="font-bold text-gray-500 uppercase">Size:</span>
              <span className="bg-gray-100 px-4 py-1 rounded-full font-bold">{product.size}</span>
            </div>
            <p className="text-gray-600 leading-relaxed min-h-[100px]">{product.description}</p>
            <button className="w-full bg-black text-white py-5 rounded-2xl font-black text-xl hover:bg-gray-800 transition-all active:scale-95 shadow-lg">
              ADD TO CART
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}