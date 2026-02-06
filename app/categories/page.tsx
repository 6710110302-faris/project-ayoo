'use client'
import Link from 'next/link'

const categories = [
  {
    name: 'All Collection',
    slug: '', 
    description: 'VIEW ALL ITEMS',
    image: '/al.png' 
  },
  {
    name: 'T-Shirts',
    slug: 'tshirt',
    description: 'ESSENTIAL TEES',
    image: '/tshirt1.png'
  },
  {
    name: 'Hoodies',
    slug: 'hoodie',
    description: 'STREETWEAR STYLE',
    image: '/hoodie.png'
  },
  {
    name: 'Sweaters',
    slug: 'sweater',
    description: 'SOFT LAYERS',
    image: '/sweater.png'
  }
]

export default function CategoriesPage() {
  return (
    <div className="max-w-6xl mx-auto p-6 md:p-12 font-sans bg-white min-h-screen">
      <div className="mb-12">
        <h1 className="text-5xl font-black uppercase leading-none tracking-tighter text-zinc-900">
          Categories
        </h1>
        <p className="text-[9px] font-black text-zinc-300 mt-3 uppercase tracking-[0.3em]">
          Vault Classification System
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <Link 
            key={cat.name} 
            href={cat.slug ? `/shop?category=${cat.slug}` : '/shop'} 
            className="group relative h-[300px] rounded-[32px] overflow-hidden bg-zinc-100 no-underline block shadow-lg hover:shadow-2xl transition-all duration-500"
          >
            {/* Background Image */}
            <div className="absolute inset-0 w-full h-full bg-zinc-200">
               <img 
                src={cat.image} 
                
                className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                alt={cat.name}
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
            </div>
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

            {/* Content */}
            <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
              <h2 className="text-xl font-black uppercase italic tracking-tighter mb-0.5">
                {cat.name}
              </h2>
              <p className="text-[8px] font-black tracking-widest text-white/70 group-hover:text-white transition-colors uppercase">
                {cat.description}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-20 text-center">
        <p className="text-[10px] font-black text-zinc-200 uppercase tracking-[0.8em]">FOUFIVVEL DEP. 2026</p>
      </div>
    </div>
  )
}