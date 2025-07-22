'use client';

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Face 2FA Login
          </h1>
          <p className="text-gray-600 mb-8">
            ระบบเข้าสู่ระบบด้วยการยืนยันใบหน้า
          </p>
          
          <div className="bg-white rounded-lg shadow-lg p-8 space-y-4">
            <div className="text-6xl mb-4">🔐</div>
            
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              ยินดีต้อนรับ
            </h2>
            
            <div className="space-y-3">
              <button
                onClick={() => router.push('/login')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                เข้าสู่ระบบ
              </button>
              
              <button
                onClick={() => router.push('/register')}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                ลงทะเบียน
              </button>
            </div>
            
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
