'use client'
import React, { createContext, useContext, useState, useEffect } from 'react'

// กำหนดโครงสร้างสินค้า
interface CartItem {
  id: string
  name: string
  price: number
  image_url: string[] | string
  size: string
}

interface CartContextType {
  cart: CartItem[]
  addToCart: (product: CartItem) => void
  removeFromCart: (id: string) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])

  // โหลดข้อมูลจาก LocalStorage เมื่อเปิดเว็บครั้งแรก
  useEffect(() => {
    const savedCart = localStorage.getItem('ayyooya-cart')
    if (savedCart) setCart(JSON.parse(savedCart))
  }, [])

  // บันทึกข้อมูลลง LocalStorage ทุกครั้งที่ตะกร้าเปลี่ยน
  useEffect(() => {
    localStorage.setItem('ayyooya-cart', JSON.stringify(cart))
  }, [cart])

  const addToCart = (product: CartItem) => {
    setCart((prev) => [...prev, product])
  }

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }

  const clearCart = () => setCart([])

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

// Hook สำหรับดึงไปใช้งานง่ายๆ
export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within a CartProvider')
  return context
}