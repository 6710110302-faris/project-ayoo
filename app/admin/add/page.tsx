'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'

export default function AddProduct() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    size: 'M', // 🌟 กำหนดค่าเริ่มต้นเป็น M
    description: '',
    category: 'tshirt'
  })

  // ฟังก์ชันจัดการตอนเลือกไฟล์และทำ Preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      setFiles((prev) => [...prev, ...selectedFiles])

      const newPreviews = selectedFiles.map(file => URL.createObjectURL(file))
      setPreviews((prev) => [...prev, ...newPreviews])
    }
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (files.length === 0) return alert('กรุณาเลือกรูปภาพอย่างน้อย 1 รูป')
    setLoading(true)

    try {
      const imageUrls = []
      for (const file of files) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `products/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath)
        
        imageUrls.push(publicUrl)
      }

      const { error: insertError } = await supabase
        .from('products')
        .insert([{
          ...formData,
          price: parseInt(formData.price),
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
    <div className="max-w-3xl mx-auto p-6 md:p-12 font-sans">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-black italic uppercase leading-none tracking-tight text-zinc-900">New Arrival</h1>
        <p className="text-gray-400 font-bold text-[10px] tracking-[0.4em] mt-3 uppercase">Create New Product Entry</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-white border border-gray-100 p-8 md:p-12 rounded-[48px] shadow-2xl shadow-zinc-200/50">
        
        {/* Upload Section */}
        <div className="space-y-4">
          <label className="text-[11px] font-black ml-4 text-gray-400 uppercase tracking-widest">Product Images</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 border-2 border-dashed border-gray-100 rounded-[32px] bg-gray-50/50">
            {previews.map((url, index) => (
              <div key={index} className="relative aspect-square group animate-in fade-in zoom-in duration-300">
                <img src={url} className="w-full h-full object-cover rounded-2xl border border-white shadow-md" alt="Preview" />
                <button 
                  type="button"
                  onClick={() => removeFile(index)} 
                  className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14}/>
                </button>
              </div>
            ))}
            
            <label className="flex flex-col items-center justify-center aspect-square cursor-pointer bg-white hover:bg-zinc-50 rounded-2xl border-2 border-dashed border-zinc-200 transition-all group">
              <Upload className="text-zinc-300 group-hover:text-black transition-colors" size={28} />
              <span className="text-[9px] font-black text-gray-400 mt-2">ADD PHOTOS</span>
              <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          </div>
        </div>

        {/* Input Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="text-[11px] font-black ml-4 mb-2 block text-gray-400 uppercase">Product Title</label>
            <input 
              className="w-full p-5 bg-gray-50 rounded-[22px] outline-none font-bold border border-transparent focus:border-zinc-200 focus:bg-white transition-all text-sm"
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="text-[11px] font-black ml-4 mb-2 block text-gray-400 uppercase">Price (THB)</label>
            <input 
              type="number"
              className="w-full p-5 bg-gray-50 rounded-[22px] outline-none font-bold border border-transparent focus:border-zinc-200 focus:bg-white transition-all text-sm"
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              required
            />
          </div>

          {/* 🌟 แก้ไขส่วน Size ให้เป็น Select */}
          <div>
            <label className="text-[11px] font-black ml-4 mb-2 block text-gray-400 uppercase">Size / Fit</label>
            <select
              value={formData.size}
              className="w-full p-5 bg-gray-50 rounded-[22px] outline-none font-bold border border-transparent focus:border-zinc-200 focus:bg-white transition-all text-sm appearance-none cursor-pointer"
              onChange={(e) => setFormData({...formData, size: e.target.value})}
              required
            >
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-[11px] font-black ml-4 mb-2 block text-gray-400 uppercase">Category</label>
            <select 
              value={formData.category}
              className="w-full p-5 bg-gray-50 rounded-[22px] outline-none font-bold border border-transparent focus:border-zinc-200 focus:bg-white transition-all text-sm appearance-none cursor-pointer"
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              required
            >
              <option value="tshirt">T-SHIRT</option>
              <option value="hoodie">HOODIE</option>
              <option value="sweater">SWEATER</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-[11px] font-black ml-4 mb-2 block text-gray-400 uppercase">Story & Details</label>
            <textarea 
              className="w-full p-6 bg-gray-50 rounded-[28px] outline-none font-bold border border-transparent focus:border-zinc-200 focus:bg-white transition-all min-h-[160px] text-sm leading-relaxed"
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>
        </div>

        <button 
          disabled={loading}
          className="w-full bg-black text-white py-6 rounded-[28px] font-black text-sm tracking-[0.2em] shadow-xl hover:bg-zinc-800 transition-all active:scale-95 disabled:bg-zinc-300 flex justify-center items-center gap-3 uppercase"
        >
          {loading ? (
            <><Loader2 className="animate-spin" size={20} /> Publishing...</>
          ) : (
            'Confirm & Publish'
          )}
        </button>
      </form>
    </div>
  )
}