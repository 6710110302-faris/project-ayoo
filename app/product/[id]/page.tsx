'use client'
import { useState, useEffect, use } from 'react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'
import { useCart } from '../../context/CartContext'
import { useRouter } from 'next/navigation'
import { ShoppingBag, Lock, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { addToCart, cart = [] } = useCart() 
  const router = useRouter()
  const [product, setProduct] = useState<any>(null)
  const [mainImage, setMainImage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [user, setUser] = useState<any>(null)

  const isAlreadyInCart = cart?.some((item: any) => item.id === id)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    checkUser()

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
        setError(err.message)
      }
    }
    fetchProduct()
  }, [id])

  const handleAddToCart = () => {
    if (!product || product.is_sold) return 
    if (isAlreadyInCart) {
      alert('สินค้านี้อยู่ในตะกร้าของคุณแล้ว')
      return
    }
    if (!user) {
      alert('กรุณาล็อกอินก่อนเพิ่มสินค้าลงตะกร้า')
      router.push('/login')
      return
    }
    setIsAdding(true)
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      size: product.size
    })
    setTimeout(() => { setIsAdding(false) }, 400)
  }

  if (error) return <div className="p-20 text-center text-red-500 font-bold uppercase tracking-[0.2em]">Error: {error}</div>
  if (!product) return <div className="p-20 text-center font-black animate-pulse text-zinc-300 italic tracking-[0.5em]">SCANNING VAULT...</div>

  const images = Array.isArray(product.image_url) ? product.image_url : [product.image_url]

  return (
    <div className="max-w-6xl mx-auto p-6 font-sans text-zinc-900">
      <Link href="/" className="text-gray-400 hover:text-black mb-12 inline-block transition font-black text-[10px] tracking-widest no-underline uppercase italic border-none bg-transparent">
        ← BACK TO SHOP
      </Link>
      
      <div className="grid md:grid-cols-2 gap-16 items-start">
        {/* Left: Images */}
        <div className="space-y-8 sticky top-12">
          <div className="aspect-square rounded-[48px] overflow-hidden bg-zinc-50 border border-zinc-100 shadow-2xl relative">
            <img src={mainImage} className={`w-full h-full object-cover transition-all duration-700 ${product.is_sold ? 'grayscale opacity-70 scale-110' : ''}`} alt={product.name} />
            {product.is_sold && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[2px]">
                <span className="bg-black text-white px-10 py-4 rounded-full font-black italic text-xl tracking-[0.4em] transform -rotate-12 border-4 border-white shadow-2xl">SOLD OUT</span>
              </div>
            )}
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar justify-center">
            {images.map((img: string, i: number) => (
              <button key={i} onClick={() => setMainImage(img)} className={`w-20 h-24 rounded-2xl overflow-hidden border-2 transition-all ${mainImage === img ? 'border-black scale-90' : 'border-transparent opacity-40'} border-none cursor-pointer bg-transparent`}>
                <img src={img} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Details */}
        <div className="flex flex-col h-full justify-center">
          <div className="mb-2">
            <span className="text-zinc-400 text-[10px] font-black tracking-[0.4em] uppercase">{product.category || 'VINTAGE'}</span>
          </div>

          <h1 className={`text-6xl font-black mb-4 uppercase leading-none tracking-tighter ${product.is_sold ? 'text-zinc-400' : 'text-zinc-900'}`}>{product.name}</h1>
          <p className={`text-4xl font-black mb-12 tracking-tighter ${product.is_sold ? 'text-zinc-300 line-through' : 'text-green-400'}`}>฿ {product.price?.toLocaleString()}</p>
          
          <div className="space-y-12 border-t border-zinc-100 pt-12">
            <div className="flex items-center gap-6">
              <span className="font-black text-[10px] text-zinc-400 uppercase tracking-widest">Selected Size:</span>
              <span className="bg-zinc-900 text-white px-6 py-2 rounded-2xl font-black text-sm uppercase italic shadow-lg">{product.size}</span>
            </div>
            
            {/* 🌟 ปรับปรุง: กล่องข้อความที่ตัดคำอัตโนมัติและกว้างเท่าปุ่ม */}
            <div className="w-full">
              <h3 className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.3em] mb-4 italic">Product Manifest</h3>
              <div className="bg-zinc-50/50 p-8 rounded-[32px] border border-zinc-50">
                <p className="text-zinc-500 leading-relaxed text-sm font-medium whitespace-pre-wrap break-words overflow-hidden">
                  {product.description || 'No additional data available for this vault item.'}
                </p>
              </div>
            </div>

            <div className="pt-4">
              <button 
                onClick={handleAddToCart}
                disabled={isAdding || product.is_sold || isAlreadyInCart}
                className={`w-full py-8 rounded-full font-black text-xs tracking-[0.4em] uppercase flex items-center justify-center gap-3 transition-all shadow-2xl border-none cursor-pointer italic ${
                  product.is_sold 
                  ? 'bg-zinc-100 text-zinc-300 cursor-not-allowed' 
                  : isAlreadyInCart
                  ? 'bg-green-50 text-green-600 border-2 border-green-200 shadow-none' 
                  : !user 
                  ? 'bg-zinc-900 text-zinc-400' 
                  : 'bg-black text-white hover:bg-zinc-800 active:scale-95'
                }`}
              >
                {product.is_sold ? 'SOLD OUT' : isAlreadyInCart ? <><CheckCircle2 size={18} /> ALREADY IN VAULT</> : isAdding ? 'ADDING...' : 'ADD TO VAULT'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}