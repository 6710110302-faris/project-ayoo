'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function AddProduct() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [files, setFiles] = useState<FileList | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    size: '',
    description: '',
    category: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!files) return alert('กรุณาเลือกรูปภาพอย่างน้อย 1 รูป')
    setLoading(true)

    try {
      const imageUrls = []

      // 1. วนลูปอัปโหลดรูปภาพทีละรูปเข้า Storage
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        // 2. ดึง Public URL ของรูปที่อัปโหลดเสร็จแล้ว
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath)
        
        imageUrls.push(publicUrl)
      }

      // 3. บันทึกข้อมูลทั้งหมดลงตาราง products (image_url จะเป็น Array)
      const { error: insertError } = await supabase
        .from('products')
        .insert([{
          ...formData,
          price: parseInt(formData.price),
          image_url: imageUrls, // ส่งเป็น Array ของ URL
          is_sold: false
        }])

      if (insertError) throw insertError

      alert('ลงขายสินค้าสำเร็จ!')
      router.push('/') // กลับไปหน้าหลัก
      router.refresh()
    } catch (error: any) {
      alert('เกิดข้อผิดพลาด: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-black mb-8">ลงขายสินค้าใหม่</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-bold mb-2">รูปภาพสินค้า (เลือกได้หลายรูป)</label>
          <input 
            type="file" 
            multiple 
            accept="image/*"
            onChange={(e) => setFiles(e.target.files)}
            className="w-full p-2 border-2 border-dashed rounded-xl"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <input 
            placeholder="ชื่อสินค้า" 
            className="p-4 border rounded-xl"
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
          <input 
            placeholder="ราคา (เฉพาะตัวเลข)" 
            type="number"
            className="p-4 border rounded-xl"
            onChange={(e) => setFormData({...formData, price: e.target.value})}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <input 
            placeholder="ไซส์ (เช่น L, XL, อก 42)" 
            className="p-4 border rounded-xl"
            onChange={(e) => setFormData({...formData, size: e.target.value})}
          />
          <input 
            placeholder="หมวดหมู่" 
            className="p-4 border rounded-xl"
            onChange={(e) => setFormData({...formData, category: e.target.value})}
          />
        </div>

        <textarea 
          placeholder="รายละเอียดสินค้า..." 
          className="w-full p-4 border rounded-xl h-32"
          onChange={(e) => setFormData({...formData, description: e.target.value})}
        />

        <button 
          disabled={loading}
          className="w-full bg-black text-white py-4 rounded-2xl font-bold text-xl hover:bg-gray-800 disabled:bg-gray-400"
        >
          {loading ? 'กำลังอัปโหลด...' : 'ยืนยันลงขาย'}
        </button>
      </form>
    </div>
  )
}