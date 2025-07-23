// หน้าเข้าสู่ระบบ (Login Page)
// ขั้นตอนที่ 1 ของ 2FA: ยืนยัน email/password ก่อน

'use client'; // Client Component เพื่อใช้ React hooks

import { useState } from 'react';         // React hook สำหรับ state management
import { useRouter } from 'next/navigation'; // Next.js router

export default function LoginPage() {
  // State variables สำหรับจัดการข้อมูลในฟอร์ม login
  const [email, setEmail] = useState('');       // อีเมลที่ผู้ใช้กรอก
  const [password, setPassword] = useState(''); // รหัสผ่าน
  const [loading, setLoading] = useState(false); // สถานะการ loading
  const [error, setError] = useState('');       // ข้อความ error
  const router = useRouter();                  // Router instance

  /**
   * ฟังก์ชันจัดการการส่งฟอร์มเข้าสู่ระบบ
   * ตรวจสอบ email/password และตัดสินใจว่าต้องทำ Face 2FA หรือไม่
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // ป้องการ reload หน้า default
    setLoading(true);   // เริ่ม loading state
    setError('');       // ล้าง error เก่า

    try {
      // ส่ง POST request ไป API login
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }), // ส่งข้อมูล login
      });

      const data = await response.json(); // รับ response จาก API

      if (response.ok) { // หาก login สำเร็จ
        // เก็บข้อมูลผู้ใช้ใน localStorage เพื่อใช้ในหน้าถัดไป
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // ตรวจสอบว่าต้องทำ Face 2FA หรือไม่
        if (data.requiresFaceVerification) {
          // ผู้ใช้ได้ลงทะเบียนใบหน้าไว้ -> ต้องยืนยันใบหน้า
          router.push('/verify-face');
        } else {
          // ผู้ใช้ยังไม่ได้ลงทะเบียนใบหน้า -> เข้าระบบได้เลย
          router.push('/dashboard');
        }
      } else { // หาก login ล้มเหลว (เช่น email/password ผิด)
        setError(data.error || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
      }
    } catch (error) {
      // Network error หรือ server ปิด
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setLoading(false); // ปิด loading ในทุกกรณี
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            เข้าสู่ระบบ
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            ระบบ Face 2FA Login
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                อีเมล
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="กรอกอีเมลของคุณ"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                รหัสผ่าน
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="กรอกรหัสผ่าน"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
          </div>

          <div className="text-center">
            <a
              href="/register"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              ยังไม่มีบัญชี? ลงทะเบียน
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}