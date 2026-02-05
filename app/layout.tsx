import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar"; // 1. นำ Navbar เข้ามาใช้งาน

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AYYOOYA DIWA | STUSSY SHOP", // เปลี่ยนชื่อเว็บให้ดูโปรขึ้น
  description: "Vintage Stussy and more",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-black`}
      >
        {/* 2. ใส่ Navbar ไว้ตรงนี้เพื่อให้โชว์ทุกหน้า */}
        <Navbar /> 
        
        {/* 3. ห่อ children ด้วย container เพื่อให้เนื้อหาไม่ชิดขอบจอเกินไป */}
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}