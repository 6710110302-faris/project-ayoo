'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../../lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import { Upload, X, Loader2, Plus, ChevronLeft } from 'lucide-react'

export default function EditProductPage() {
  const { id } = useParams()
  const router = useRouter()
  
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [size, setSize] = useState('')
  const [category, setCategory] = useState('') 
  const [description, setDescription] = useState('')
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  // 🌟 ปรับปรุง: ใช้ตัวพิมพ์เล็กทั้งหมดเพื่อให้ตรงกับระบบ Filter ในหน้า Shop
  const categories = ['tshirt', 'sweater', 'hoodie']
  const sizes = ['S', 'M', 'L', 'XL']

  useEffect(() => {
    const fetchProduct = async () => {
      const { data } = await supabase.from('products').select('*').eq('id', id).single()
      if (data) {
        setName(data.name)
        setPrice(data.price.toString())
        setSize(data.size || '')
        // 🌟 ตรวจสอบให้แน่ใจว่าดึงค่ามาแล้วเป็นตัวพิมพ์เล็ก
        setCategory(data.category?.toLowerCase() || '')
        setDescription(data.description || '')
        const imgs = Array.isArray(data.image_url) ? data.image_url : [data.image_url].filter(Boolean)
        setImageUrls(imgs)
      }
      setLoading(false)
    }
    fetchProduct()
  }, [id])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUpdating(true)
    const newUrls = [...imageUrls]

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `products/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file)

      if (!uploadError) {
        const { data } = supabase.storage.from('product-images').getPublicUrl(filePath)
        newUrls.push(data.publicUrl)
      }
    }

    setImageUrls(newUrls)
    setUpdating(false)
  }

  const removeImage = (indexToRemove: number) => {
    setImageUrls(imageUrls.filter((_, index) => index !== indexToRemove))
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdating(true)
    
    const { error } = await supabase.from('products')
      .update({ 
        name, 
        price: Number(price), 
        size,
        category: category.toLowerCase(), // 🌟 บังคับบันทึกเป็นตัวพิมพ์เล็กเสมอ
        description,
        image_url: imageUrls 
      })
      .eq('id', id)
    
    if (!error) {
      alert('อัปเดตข้อมูลสินค้าเรียบร้อย!')
      router.push('/admin/add/dashboard')
    }
    setUpdating(false)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center font-black italic animate-pulse text-zinc-300 tracking-widest uppercase text-xs">
      Vault Synchronizing...
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto mt-10 mb-20 p-6 md:p-12 bg-white border border-gray-100 rounded-[40px] shadow-2xl font-sans text-zinc-900">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-zinc-400 mb-8 font-black text-[10px] tracking-widest hover:text-black transition-colors uppercase italic border-none bg-transparent cursor-pointer"
      >
        <ChevronLeft size={16} /> Back
      </button>

      <div className="mb-10">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter">Edit Product Gallery</h1>
        <p className="text-[10px] font-black text-zinc-300 mt-2 uppercase tracking-[0.4em]">Vault Management System</p>
      </div>
      
      <form onSubmit={handleUpdate} className="space-y-12">
        
        {/* Gallery Section */}
        <div className="space-y-4">
          <label className="text-[10px] font-black ml-4 text-gray-400 uppercase tracking-widest italic">Product Gallery ({imageUrls.length})</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-8 bg-zinc-50/50 border-2 border-dashed border-zinc-100 rounded-[32px]">
            {imageUrls.map((url, index) => (
              <div key={index} className="relative aspect-[3/4] group animate-in fade-in zoom-in duration-300">
                <img src={url} className="w-full h-full object-cover rounded-2xl border border-gray-100 shadow-sm transition-transform group-hover:scale-[1.02]" alt="Preview" />
                <button 
                  type="button"
                  onClick={() => removeImage(index)} 
                  className="absolute -top-2 -right-2 bg-black text-white p-2 rounded-full shadow-lg hover:bg-red-500 transition-colors border-none cursor-pointer"
                >
                  <X size={12}/>
                </button>
                {index === 0 && (
                  <span className="absolute bottom-2 left-2 bg-black text-[7px] text-white px-3 py-1 rounded-full font-black tracking-widest uppercase">THUMBNAIL</span>
                )}
              </div>
            ))}

            <label className="flex flex-col items-center justify-center aspect-[3/4] cursor-pointer bg-white hover:bg-zinc-100 rounded-2xl border-2 border-dashed border-zinc-200 transition-all group shadow-sm">
              <Plus className="text-zinc-300 group-hover:text-black transition-colors" size={32} />
              <span className="text-[8px] font-black text-zinc-400 mt-3 tracking-widest uppercase">Add Image</span>
              <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" multiple />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-8 md:col-span-2">
            <div>
              <label className="text-[10px] font-black ml-4 mb-3 block text-gray-400 uppercase italic tracking-widest">Product Name</label>
              <input 
                className="w-full p-5 bg-zinc-50 rounded-2xl outline-none font-black text-lg border border-transparent focus:ring-2 focus:ring-black transition-all" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black ml-4 mb-3 block text-gray-400 uppercase italic tracking-widest">Price (฿)</label>
            <input 
              className="w-full p-5 bg-zinc-50 rounded-2xl outline-none font-black text-lg border border-transparent focus:ring-2 focus:ring-black transition-all" 
              type="number" 
              value={price} 
              onChange={(e) => setPrice(e.target.value)} 
              required 
            />
          </div>

          {/* 🌟 Category Selection (ปรับปรุงการแสดงผล) */}
          <div>
            <label className="text-[10px] font-black ml-4 mb-3 block text-gray-400 uppercase italic tracking-widest">Category</label>
            <div className="flex flex-wrap gap-2 p-2 bg-zinc-50 rounded-2xl">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-6 py-2 rounded-xl text-[9px] font-black transition-all border cursor-pointer ${
                    category === cat ? 'bg-black text-white border-black shadow-lg' : 'bg-white text-zinc-400 border-zinc-100 hover:border-zinc-300'
                  }`}
                >
                  {cat.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div className="md:col-span-2">
            <label className="text-[10px] font-black ml-4 mb-3 block text-gray-400 uppercase italic tracking-widest">Size Selection</label>
            <div className="flex flex-wrap gap-3 p-4 bg-zinc-50 rounded-2xl">
              {sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={`w-20 py-3 rounded-xl text-xs font-black transition-all border cursor-pointer ${
                    size === s ? 'bg-black text-white border-black shadow-lg scale-95' : 'bg-white text-zinc-400 border-zinc-100 hover:border-zinc-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="text-[10px] font-black ml-4 mb-3 block text-gray-400 uppercase italic tracking-widest">Full Description</label>
            <textarea 
              className="w-full p-6 bg-zinc-50 rounded-[32px] outline-none font-bold min-h-[180px] border border-transparent focus:ring-2 focus:ring-black transition-all leading-relaxed" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell more about this product..."
            />
          </div>
        </div>

        <button 
          disabled={updating}
          className="w-full bg-black text-white py-6 rounded-full font-black shadow-2xl hover:bg-zinc-800 transition active:scale-95 disabled:opacity-50 flex justify-center items-center gap-3 text-[11px] tracking-[0.3em] uppercase italic border-none cursor-pointer"
        >
          {updating ? <Loader2 className="animate-spin" size={20} /> : 'Save All Changes'}
        </button>
      </form>
    </div>
  )
}