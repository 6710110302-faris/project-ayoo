'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      } else {
        setUser(user)
      }
    }
    checkUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (!user) return <div className="p-20 text-center font-bold uppercase tracking-widest">Checking session...</div>

  return (
    <div className="max-w-2xl mx-auto mt-20 p-12 bg-white rounded-[40px] border border-gray-100 shadow-xl text-center">
      <div className="w-24 h-24 bg-[#A855F7] text-white rounded-full mx-auto mb-6 flex items-center justify-center text-4xl font-black shadow-lg">
        {user.email?.[0].toUpperCase()}
      </div>
      <h1 className="text-2xl font-black uppercase mb-2">{user.email}</h1>
      <p className="text-gray-400 font-bold mb-10 tracking-widest uppercase text-xs">
        Status: <span className="text-black">{user.user_metadata?.role || 'User'}</span>
      </p>
      
      <button 
        onClick={handleLogout}
        className="bg-red-50 text-red-500 px-10 py-3 rounded-full font-black text-sm hover:bg-red-500 hover:text-white transition-all active:scale-95"
      >
        LOGOUT FROM SYSTEM
      </button>
    </div>
  )
}