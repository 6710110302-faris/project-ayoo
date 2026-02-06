'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react' // นำเข้าไอคอนดวงตา

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false) // สถานะโชว์/ซ่อนรหัสผ่าน
  const [showConfirmPassword, setShowConfirmPassword] = useState(false) // สถานะโชว์/ซ่อนการยืนยัน
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
    <div className="max-w-md mx-auto mt-20 p-10 bg-white border border-gray-100 rounded-[40px] shadow-2xl font-sans">
      <h1 className="text-3xl font-black mb-2 uppercase italic text-center text-zinc-900 leading-tight">Register</h1>
      <p className="text-center text-zinc-300 text-[10px] font-black mb-8 tracking-[0.3em]">BECOME A MEMBER OF THE VAULT</p>
      
      <form onSubmit={handleRegister} className="space-y-5">
        <div>
          <label className="text-[10px] font-black ml-4 mb-2 block text-zinc-400 tracking-widest uppercase">Email Address</label>
          <input 
            type="email" 
            placeholder="your@email.com" 
            className="w-full p-4 bg-zinc-50 border-none rounded-2xl font-bold text-sm focus:ring-2 focus:ring-black outline-none text-black transition-all"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* ช่อง Password */}
        <div>
          <label className="text-[10px] font-black ml-4 mb-2 block text-zinc-400 tracking-widest uppercase">Password</label>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="••••••••" 
              className="w-full p-4 bg-zinc-50 border-none rounded-2xl font-bold text-sm focus:ring-2 focus:ring-black outline-none text-black transition-all"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-black transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* ช่อง Confirm Password */}
        <div>
          <label className="text-[10px] font-black ml-4 mb-2 block text-zinc-400 tracking-widest uppercase">Confirm Password</label>
          <div className="relative">
            <input 
              type={showConfirmPassword ? "text" : "password"} 
              placeholder="••••••••" 
              className="w-full p-4 bg-zinc-50 border-none rounded-2xl font-bold text-sm focus:ring-2 focus:ring-black outline-none text-black transition-all"
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-black transition-colors"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-zinc-900 text-white py-4 rounded-2xl font-black text-xs tracking-[0.2em] uppercase hover:bg-black transition-all active:scale-95 shadow-xl shadow-zinc-100 mt-4"
        >
          {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
        </button>
      </form>

      <div className="mt-8 text-center border-t border-zinc-50 pt-6">
        <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">
          Already have an account? 
          <Link href="/login" className="text-zinc-900 underline ml-2 hover:text-black transition-colors">Login</Link>
        </p>
      </div>
    </div>
  )
}