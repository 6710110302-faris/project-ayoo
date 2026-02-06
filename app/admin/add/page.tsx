'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import { Upload, X, Loader2, ChevronLeft, Plus } from 'lucide-react'

export default function AddProduct() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  // States สำหรับข้อมูลสินค้า (ใช้โครงสร้างเดียวกับหน้า Edit เพื่อความเสถียร)
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [size, setSize] = useState('M')
  const [category, setCategory] = useState('tshirt') 
  const [description, setDescription] = useState('')
  const [imageUrls, setImageUrls] = useState<string[]>([])

  const categories = ['tshirt', 'sweater', 'hoodie']
  const sizes = ['S', 'M', 'L', 'XL']

  // ฟังก์ชันอัปโหลดรูปภาพ (ใช้ Logic เดียวกับหน้า Edit)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setLoading(true)
    const newUrls = [...imageUrls]

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `products/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file)

      if (!uploadError) {
        const { data } = supabase.storage.from('product-images').getPublicUrl(filePath)
        newUrls.push(data.publicUrl)
      } else {
        console.error("Upload Error:", uploadError.message)
      }
    }

    setImageUrls(newUrls)
    setLoading(false)
  }

  const removeImage = (indexToRemove: number) => {
    setImageUrls(imageUrls.filter((_, index) => index !== indexToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (imageUrls.length === 0) return alert('กรุณาเพิ่มรูปภาพอย่างน้อย 1 รูป')
    
    setLoading(true)

    try {
      const { error: insertError } = await supabase
        .from('products')
        .insert([{
          name,
          price: Number(price),
          size,
          category: category.toLowerCase(),
          description,
          image_url: imageUrls,
          is_sold: false
        }])

      if (insertError) throw insertError

      alert('ลงขายสินค้าสำเร็จ!')
      router.push('/admin/add/dashboard')
      router.refresh()
    } catch (error: any) {
      alert('เกิดข้อผิดพลาด: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-12 font-sans bg-white min-h-screen text-zinc-900">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-zinc-400 mb-8 font-black text-[10px] tracking-widest hover:text-black transition-colors uppercase italic border-none bg-transparent cursor-pointer"
      >
        <ChevronLeft size={16} /> Back
      </button>

      <div className="mb-10">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter">New Arrival</h1>
        <p className="text-[10px] font-black text-zinc-300 mt-2 uppercase tracking-[0.4em]">Vault Management System</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12 bg-white border border-gray-100 p-8 md:p-12 rounded-[48px] shadow-2xl shadow-zinc-200/50">
        
        {/* Gallery Section (เหมือนหน้า Edit) */}
        <div className="space-y-4">
          <label className="text-[10px] font-black ml-4 text-gray-400 uppercase tracking-widest italic">Product Gallery ({imageUrls.length})</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-8 bg-zinc-50/50 border-2 border-dashed border-zinc-100 rounded-[32px]">
            {imageUrls.map((url, index) => (
              <div key={index} className="relative aspect-[3/4] group animate-in fade-in zoom-in duration-300">
                <img src={url} className="w-full h-full object-cover rounded-2xl border border-gray-100 shadow-sm" alt="Preview" />
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

        {/* Input Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="md:col-span-2">
            <label className="text-[10px] font-black ml-4 mb-3 block text-gray-400 uppercase italic tracking-widest">Product Name</label>
            <input 
              className="w-full p-5 bg-zinc-50 rounded-2xl outline-none font-black text-lg border border-transparent focus:ring-2 focus:ring-black transition-all text-zinc-900"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter product title..."
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-black ml-4 mb-3 block text-gray-400 uppercase italic tracking-widest">Price (฿)</label>
            <input 
              type="number"
              className="w-full p-5 bg-zinc-50 rounded-2xl outline-none font-black text-lg border border-transparent focus:ring-2 focus:ring-black transition-all text-zinc-900"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0"
              required
            />
          </div>

          {/* Category Selection */}
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
            <label className="text-[10px] font-black ml-4 mb-3 block text-gray-400 uppercase italic tracking-widest">Story & Details</label>
            <textarea 
              className="w-full p-6 bg-zinc-50 rounded-[32px] outline-none font-bold min-h-[180px] border border-transparent focus:ring-2 focus:ring-black transition-all text-sm leading-relaxed"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell the story of this piece..."
            />
          </div>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-6 rounded-full font-black text-[11px] tracking-[0.3em] shadow-2xl hover:bg-zinc-800 transition-all active:scale-95 disabled:bg-zinc-300 flex justify-center items-center gap-3 uppercase italic border-none cursor-pointer"
        >
          {loading ? (
            <><Loader2 className="animate-spin" size={20} /> SYNCING TO VAULT...</>
          ) : (
            'Confirm & Publish'
          )}
        </button>
      </form>
    </div>
  )
}