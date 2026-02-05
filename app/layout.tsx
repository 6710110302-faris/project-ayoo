import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar"; 
import { CartProvider } from "./context/CartContext"; // 1. นำ CartProvider เข้ามา

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AYYOOYA DIWA | STUSSY SHOP",
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
        {/* 2. หุ้มทุกอย่างด้วย CartProvider */}
        {/* ต้องครอบทั้ง Navbar และ main เพื่อให้ทุกส่วนเข้าถึงข้อมูลตะกร้าได้ */}
        <CartProvider>
          
          <Navbar /> 
          
          <main className="min-h-screen">
            {children}
          </main>
          
        </CartProvider>
      </body>
    </html>
  );
}