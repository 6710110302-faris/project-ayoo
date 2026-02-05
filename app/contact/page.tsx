'use client'
import React from 'react'
import { Instagram, MapPin, Mail } from 'lucide-react'

export default function ContactPage() {
  return (
    // ใช้ min-h-screen และ flex center เพื่อให้เนื้อหาอยู่กลางหน้าจอพอดี
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-20 font-sans bg-white">
      
      <div className="max-w-md w-full space-y-16 text-center md:text-left">
        
        {/* Header Section */}
        <div className="space-y-4">
          <h1 className="text-6xl md:text-7xl font-black italic uppercase leading-none tracking-tighter">
            Connect
          </h1>
          <p className="text-gray-400 font-bold text-[10px] tracking-[0.4em] uppercase inline-block border-b-2 border-black pb-2">
            Get in touch with us
          </p>
        </div>

        {/* Contact List */}
        <div className="space-y-10">
          
          {/* Instagram */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 group cursor-pointer">
            <div className="p-5 bg-gray-50 rounded-[24px] group-hover:bg-black group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-xl group-hover:-translate-y-1">
              <Instagram size={28} />
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Instagram</p>
              <p className="font-black text-xl uppercase italic">@foufivvel.21</p>
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 group cursor-pointer">
            <div className="p-5 bg-gray-50 rounded-[24px] group-hover:bg-black group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-xl group-hover:-translate-y-1">
              <Mail size={28} />
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Email</p>
              <p className="font-black text-xl uppercase italic">forfivel@gmail.com</p>
            </div>
          </div>

          {/* Location */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 group cursor-pointer">
            <div className="p-5 bg-gray-50 rounded-[24px] group-hover:bg-black group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-xl group-hover:-translate-y-1">
              <MapPin size={28} />
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Location</p>
              <p className="font-black text-xl uppercase italic">Bangkok, Thailand</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}