'use client'
import React from 'react'

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20 font-sans">
      <div className="space-y-16">
        {/* Header Section */}
        <section className="text-center md:text-left">
          <h1 className="text-7xl font-black italic uppercase leading-none tracking-tighter mb-6">
            Our <br /> Story
          </h1>
          <p className="text-gray-400 font-bold text-xs tracking-[0.5em] uppercase border-l-2 border-black pl-4">
            Established 2026 / Bangkok
          </p>
        </section>

        {/* Content Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="aspect-[3/4] bg-gray-100 rounded-[40px] overflow-hidden shadow-2xl">
             <img 
               src="https://vintagewholesalestore.com/cdn/shop/files/Screenshot2024-01-17at16.33.21.png?v=1710860354" 
               alt="Brand Concept" 
               className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
             />
          </div>
          <div className="space-y-6">
            <h2 className="text-2xl font-black uppercase italic">Beyond Fashion, <br />It's a Statement.</h2>
            <p className="text-gray-600 leading-relaxed font-medium">
              AYYOOYA DIWA คือพื้นที่สำหรับคนที่หลงใหลในความต่าง เราคัดสรรเฉพาะสินค้าที่มีเอกลักษณ์ 
              จากเสื้อผ้า Vintage หายาก สู่ชิ้นงาน Streetwear ที่สะท้อนตัวตนของคุณอย่างชัดเจน
            </p>
            <p className="text-gray-600 leading-relaxed font-medium">
              เราเชื่อว่าเสื้อผ้าไม่ใช่แค่สิ่งที่สวมใส่ แต่คือ "งานศิลปะ" ที่บอกเล่าเรื่องราวของผู้ใช้ 
              ทุกชิ้นในร้านเราจึงผ่านการเลือกเฟ้นด้วยสายตาที่พิถีพิถันที่สุด
            </p>
            <div className="pt-6">
               <div className="w-12 h-1 bg-black mb-4"></div>

            </div>
          </div>
        </section>
      </div>
    </div>
  )
}