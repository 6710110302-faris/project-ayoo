'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // สั่ง Login พร้อมบันทึก Session ลงในเครื่องอัตโนมัติ
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        // เมื่อ Login สำเร็จ พากลับหน้าหลัก และ Refresh เพื่อให้ Navbar อัปเดตปุ่ม SELL
        router.push('/')
        router.refresh()
      }
    } catch (err: any) {
      alert('อีเมลหรือรหัสผ่านไม่ถูกต้อง: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-10 bg-white border border-gray-100 rounded-[40px] shadow-2xl">
      <h1 className="text-3xl font-black mb-2 uppercase italic text-center">Login</h1>
      <p className="text-center text-gray-400 text-xs font-bold mb-8 tracking-widest">WELCOME BACK</p>
      
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="text-[10px] font-black ml-4 mb-1 block">EMAIL ADDRESS</label>
          <input 
            type="email" 
            placeholder="your@email.com" 
            className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold text-sm focus:ring-2 focus:ring-purple-500 outline-none text-black"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="text-[10px] font-black ml-4 mb-1 block">PASSWORD</label>
          <input 
            type="password" 
            placeholder="••••••••" 
            className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold text-sm focus:ring-2 focus:ring-purple-500 outline-none text-black"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-black text-white py-4 rounded-2xl font-black text-lg hover:bg-gray-800 transition-all active:scale-95 shadow-lg mt-4"
        >
          {loading ? 'LOGGING IN...' : 'LOG IN'}
        </button>
      </form>

      <div className="mt-8 text-center border-t pt-6">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          Don't have an account? 
          <Link href="/register" className="text-black underline ml-2 hover:text-purple-600">Register</Link>
        </p>
      </div>
    </div>
  )
}