'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../../lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import { Upload, X, Loader2, Plus } from 'lucide-react'

export default function EditProductPage() {
  const { id } = useParams()
  const router = useRouter()
  
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [size, setSize] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrls, setImageUrls] = useState<string[]>([]) // เปลี่ยนเป็น Array
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      const { data } = await supabase.from('products').select('*').eq('id', id).single()
      if (data) {
        setName(data.name)
        setPrice(data.price.toString())
        setSize(data.size || '')
        setDescription(data.description || '')
        // ตรวจสอบว่าเป็น Array หรือไม่ ถ้าไม่ใช่ให้แปลงเป็น Array
        const imgs = Array.isArray(data.image_url) ? data.image_url : [data.image_url].filter(Boolean)
        setImageUrls(imgs)
      }
      setLoading(false)
    }
    fetchProduct()
  }, [id])

  // ฟังก์ชันอัปโหลดรูป (รองรับการเพิ่มเข้าไปใน Array)
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

  // ฟังก์ชันลบรูปเฉพาะใบที่เลือก
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
        description,
        image_url: imageUrls // ส่ง Array ของรูปทั้งหมดกลับไป
      })
      .eq('id', id)
    
    if (!error) {
      alert('อัปเดตข้อมูลสินค้าเรียบร้อย!')
      router.push('/admin/add/dashboard')
    }
    setUpdating(false)
  }

  if (loading) return <div className="p-20 text-center font-black animate-pulse">LOADING...</div>

  return (
    <div className="max-w-3xl mx-auto mt-10 mb-20 p-10 bg-white border border-gray-100 rounded-[40px] shadow-2xl">
      <h1 className="text-3xl font-black italic uppercase mb-8">Edit Product Gallery</h1>
      
      <form onSubmit={handleUpdate} className="space-y-8">
        
        {/* ส่วนจัดการหลายรูปภาพ */}
        <div className="space-y-4">
          <label className="text-[10px] font-black ml-4 text-gray-400 uppercase tracking-widest">Product Gallery ({imageUrls.length})</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 border-2 border-dashed border-gray-100 rounded-[32px]">
            
            {imageUrls.map((url, index) => (
              <div key={index} className="relative aspect-square group">
                <img src={url} className="w-full h-full object-cover rounded-2xl border border-gray-100 shadow-sm" alt="Preview" />
                <button 
                  type="button"
                  onClick={() => removeImage(index)} 
                  className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14}/>
                </button>
                {index === 0 && <span className="absolute bottom-2 left-2 bg-black text-[8px] text-white px-2 py-1 rounded-md font-black">THUMBNAIL</span>}
              </div>
            ))}

            <label className="flex flex-col items-center justify-center aspect-square cursor-pointer bg-gray-50 hover:bg-gray-100 rounded-2xl border-2 border-dashed border-gray-200 transition-all group">
              <Plus className="text-gray-300 group-hover:text-black transition-colors" size={30} />
              <span className="text-[8px] font-black text-gray-400 mt-2">ADD IMAGE</span>
              <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" multiple />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="text-[10px] font-black ml-4 mb-2 block text-gray-400 uppercase">Product Name</label>
            <input className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-black" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          
          <div>
            <label className="text-[10px] font-black ml-4 mb-2 block text-gray-400 uppercase">Price (฿)</label>
            <input className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold" type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
          </div>

          <div>
            <label className="text-[10px] font-black ml-4 mb-2 block text-gray-400 uppercase">Size</label>
            <input className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold" value={size} onChange={(e) => setSize(e.target.value)} />
          </div>

          <div className="md:col-span-2">
            <label className="text-[10px] font-black ml-4 mb-2 block text-gray-400 uppercase">Full Description</label>
            <textarea 
              className="w-full p-5 bg-gray-50 rounded-[24px] outline-none font-bold min-h-[150px] leading-relaxed" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell more about this product..."
            />
          </div>
        </div>

        <button 
          disabled={updating}
          className="w-full bg-black text-white py-5 rounded-[24px] font-black shadow-xl hover:bg-gray-800 transition active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2 text-sm tracking-widest"
        >
          {updating ? <Loader2 className="animate-spin" size={20} /> : 'SAVE ALL CHANGES'}
        </button>
      </form>
    </div>
  )
}