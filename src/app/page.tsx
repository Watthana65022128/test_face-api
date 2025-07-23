// หน้าแรก (Home Page) - หน้าต้อนรับผู้ใช้และเลือกใช้ระบบ
// แสดงปุ่มสำหรับไปหน้า Login หรือ Register

'use client'; // บอก Next.js ว่าเป็น Client Component (ทำงานใน browser)

import { useRouter } from 'next/navigation'; // Next.js router สำหรับเปลี่ยนหน้า

// Component หลักของหน้าแรก
export default function Home() {
  const router = useRouter(); // สร้าง router instance สำหรับ navigation

  return (
    /* คอนเทนเอร์หลัก: เต็มหน้าจอ + center ทั้ง horizontal/vertical + gradient background */
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Card หลักของเว็บไซต์ */}
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          {/* หัวข้อหลักของเว็บไซต์ */}
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Face 2FA Login 
          </h1>
          {/* คำอธิบายระบบ */}
          <p className="text-gray-600 mb-8">
            ระบบเข้าสู่ระบบด้วยการยืนยันใบหน้า
          </p>
          
          {/* Card สีขาวสำหรับแสดงเนื้อหาหลัก */}
          <div className="bg-white rounded-lg shadow-lg p-8 space-y-4">
            {/* ไอคอนแทนข้อความ */}
            <div className="text-6xl mb-4">🔐</div>
            
            {/* ข้อความต้อนรับ */}
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              ยินดีต้อนรับ
            </h2>
            
            {/* กลุ่มปุ่มสำหรับ navigation */}
            <div className="space-y-3">
              {/* ปุ่มไปหน้า Login */}
              <button
                onClick={() => router.push('/login')} // เปลี่ยนไปหน้า /login
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                เข้าสู่ระบบ
              </button>
              
              {/* ปุ่มไปหน้า Register */}
              <button
                onClick={() => router.push('/register')} // เปลี่ยนไปหน้า /register
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                ลงทะเบียน
              </button>
            </div>
            
            {/* ข้อมูลเพิ่มเติม */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                ✨ ระบบรักษาความปลอดภัยด้วย Face Recognition
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
