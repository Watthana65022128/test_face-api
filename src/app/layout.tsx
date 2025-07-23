// Root Layout ของ Next.js App Router - เป็น layout หลักที่ครอบทุกหน้า
// ไฟล์นี้จะถูกใช้โดยทุกหน้าในแอปพลิเคชัน

import type { Metadata } from "next";             // Type สำหรับ SEO metadata
import { Geist, Geist_Mono } from "next/font/google"; // Google Fonts สำหรับการใช้ฟอนต์
import "./globals.css";                            // CSS styles ที่ใช้ทั่วทั้งแอป

// กำหนดฟอนต์ Geist Sans สำหรับข้อความทั่วไป
// variable คือ CSS custom property ที่จะใช้ใน CSS/Tailwind
const geistSans = Geist({
  variable: "--font-geist-sans", // CSS variable name
  subsets: ["latin"],            // โหลดเฉพาะตัวอักษรละติน
});

// กำหนดฟอนต์ Geist Mono สำหรับโค้ดหรือข้อความ monospace
const geistMono = Geist_Mono({
  variable: "--font-geist-mono", // CSS variable name
  subsets: ["latin"],           // โหลดเฉพาะตัวอักษรละติน
});

// Metadata สำหรับ SEO - จะแสดงใน <head> ของทุกหน้า
// ถ้าหน้าไหนไม่กำหนด metadata เอง จะใช้ค่าจากที่นี่
export const metadata: Metadata = {
  title: "Face 2FA Login System",                                    // ชื่อเว็บไซต์
  description: "ระบบเข้าสู่ระบบด้วยการยืนยันใบหน้า (Face Recognition 2FA)", // คำอธิบายเว็บไซต์
};

// Component RootLayout - เป็นโครงสร้างหลักของทุกหน้า
// children คือเนื้อหาของแต่ละหน้าที่จะแสดงภายใน layout นี้
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode; // Type สำหรับ React components
}>) {
  return (
    <html lang="th"> 
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        // className รวม:
        // - geistSans.variable: CSS variable สำหรับฟอนต์ Sans
        // - geistMono.variable: CSS variable สำหรับฟอนต์ Mono  
        // - antialiased: Tailwind class สำหรับทำให้ฟอนต์เรียบ
      >
        {children} {/* เนื้อหาของแต่ละหน้าจะแสดงตรงนี้ */}
      </body>
    </html>
  );
}
