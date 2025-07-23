// หน้าลงทะเบียนผู้ใช้ใหม่ (Register Page)
// รับข้อมูล email/password และสร้างบัญชีใหม่ในฐานข้อมูล

'use client'; // Client Component สำหรับใช้ React hooks

import { useState } from 'react';         // React hook สำหรับจัดการ state
import { useRouter } from 'next/navigation'; // Next.js router

export default function RegisterPage() {
  // State variables สำหรับจัดการข้อมูลในฟอร์ม
  const [email, setEmail] = useState('');                     // อีเมลที่ผู้ใช้กรอก
  const [password, setPassword] = useState('');               // รหัสผ่าน
  const [confirmPassword, setConfirmPassword] = useState(''); // รหัสผ่านยืนยัน
  const [loading, setLoading] = useState(false);              // สถานะการ loading
  const [message, setMessage] = useState('');                 // ข้อความสำเร็จ
  const [error, setError] = useState('');                     // ข้อความ error
  const router = useRouter();                               // Router instance

  /**
   * ฟังก์ชันจัดการการส่งฟอร์มลงทะเบียน
   * ตรวจสอบข้อมูลและส่งไป API
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // ป้องการ reload หน้า default ของ form
    
    // ตรวจสอบว่ารหัสผ่าน 2 ช่องตรงกันหรือไม่
    if (password !== confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน');
      return;
    }

    // เริ่มการลงทะเบียน
    setLoading(true);
    setError('');     // ล้าง error เก่า
    setMessage('');   // ล้างข้อความเก่า

    try {
      // ส่ง HTTP POST request ไป API /api/auth/register
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // บอกว่าส่ง JSON data
        },
        body: JSON.stringify({ email, password }), // แปลง object เป็น JSON string
      });

      const data = await response.json(); // แปลง response กลับเป็น JavaScript object

      if (response.ok) { // หาก status code 200-299 (สำเร็จ)
        setMessage('ลงทะเบียนสำเร็จ! กรุณาลงทะเบียนใบหน้า');
        
        // เก็บ userId ใน localStorage เพื่อใช้ในหน้า Face Registration
        // localStorage เก็บข้อมูลใน browser และคงอยู่จนกว่าจะปิด browser
        localStorage.setItem('userId', data.user.id);
        
        // รอ 2 วินาที แล้วไปหน้า Face Registration
        setTimeout(() => {
          router.push('/register-face');
        }, 2000);
      } else { // หากเกิด error (เช่น email ซ้ำ, validation error)
        setError(data.error || 'เกิดข้อผิดพลาดในการลงทะเบียน');
      }
    } catch (error) {
      // จัดการ network error หรือเซิร์ฟเวอร์ปิด
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setLoading(false); // ปิด loading ในทุกกรณี (สำเร็จหรือ error)
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            ลงทะเบียนบัญชีใหม่
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            สร้างบัญชีสำหรับระบบ Face 2FA
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
                minLength={6}
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                ยืนยันรหัสผ่าน
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="กรอกรหัสผ่านอีกครั้ง"
                minLength={6}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {message}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'กำลังลงทะเบียน...' : 'ลงทะเบียน'}
            </button>
          </div>

          <div className="text-center">
            <a
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              มีบัญชีแล้ว? เข้าสู่ระบบ
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}