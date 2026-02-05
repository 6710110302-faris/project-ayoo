'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      alert("รหัสผ่านไม่ตรงกัน!")
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // บันทึก Role เป็น user ตั้งแต่เริ่มต้น
          data: { role: 'user' } 
        }
      })

      if (error) throw error

      if (data.user) {
        alert('สมัครสมาชิกสำเร็จ! กำลังพาท่านไปหน้าหลัก')
        router.push('/')
        router.refresh()
      }
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-10 bg-white border border-gray-100 rounded-[40px] shadow-2xl">
      <h1 className="text-3xl font-black mb-2 uppercase italic text-center">Register</h1>
      <p className="text-center text-gray-400 text-xs font-bold mb-8 tracking-widest">BECOME A MEMBER</p>
      
      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="text-[10px] font-black ml-4 mb-1 block">EMAIL</label>
          <input 
            type="email" 
            placeholder="your@email.com" 
            className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold text-sm focus:ring-2 focus:ring-purple-500 outline-none"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="text-[10px] font-black ml-4 mb-1 block">PASSWORD</label>
          <input 
            type="password" 
            placeholder="••••••••" 
            className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold text-sm focus:ring-2 focus:ring-purple-500 outline-none"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="text-[10px] font-black ml-4 mb-1 block">CONFIRM PASSWORD</label>
          <input 
            type="password" 
            placeholder="••••••••" 
            className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold text-sm focus:ring-2 focus:ring-purple-500 outline-none"
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-black text-white py-4 rounded-2xl font-black text-lg hover:bg-gray-800 transition-all active:scale-95 shadow-lg mt-4"
        >
          {loading ? 'CREATING...' : 'CREATE ACCOUNT'}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          Already have an account? 
          <Link href="/login" className="text-black underline ml-2">Login</Link>
        </p>
      </div>
    </div>
  )
}