'use client'
import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/app/lib/supabase' // ตรวจสอบ Path นี้ให้ดีว่าสะกดถูกเป๊ะๆ

interface CartContextType {
  cart: any[]
  addToCart: (product: any) => void
  removeFromCart: (id: string, size: string) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<any[]>([])

  // โหลดข้อมูลครั้งแรก
  useEffect(() => {
    const saved = localStorage.getItem('ayyooya-cart')
    if (saved) setCart(JSON.parse(saved))
  }, [])

  // บันทึกข้อมูลลงเครื่อง
  useEffect(() => {
    localStorage.setItem('ayyooya-cart', JSON.stringify(cart))
  }, [cart])

  // 🌟 จุดที่ต้องแก้: บังคับเฝ้าดูสถานะ Auth ตลอดเวลา
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Current Auth Event:", event) // ดูใน Console ว่าขึ้น SIGNED_OUT ไหม
      
      if (event === 'SIGNED_OUT' || !session) {
        console.log("Clearing cart now...")
        setCart([])
        localStorage.removeItem('ayyooya-cart')
        localStorage.clear() // บังคับล้างทุกอย่างในเครื่องเพื่อความชัวร์
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const addToCart = (product: any) => setCart((prev) => [...prev, product])
  const removeFromCart = (id: string, size: string) => 
    setCart((prev) => prev.filter((item) => !(item.id === id && item.size === size)))
  const clearCart = () => {
    setCart([])
    localStorage.removeItem('ayyooya-cart')
  }

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within a CartProvider')
  return context
}