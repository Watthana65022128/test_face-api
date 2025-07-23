// หน้า Dashboard - หน้าหลักหลังจากเข้าสู่ระบบสำเร็จ
// แสดงข้อมูลผู้ใช้และยืนยันว่าผ่าน Face 2FA มาแล้ว

'use client'; // Client Component เพื่อใช้ React hooks

import { useEffect, useState } from 'react'; // React hooks
import { useRouter } from 'next/navigation';  // Next.js router

export default function DashboardPage() {
  // State variables
  const [user, setUser] = useState<any>(null); // ข้อมูลผู้ใช้ที่เข้าสู่ระบบสำเร็จแล้ว
  const router = useRouter();              // Router instance

  // useEffect - ทำงานเมื่อ component โหลดเสร็จ
  useEffect(() => {
    // ตรวจสอบว่าผู้ใช้ได้ login และผ่าน 2FA แล้วหรือยัง
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      // หากไม่มีข้อมูลผู้ใช้ = ยังไม่ได้ login หรือ session หมดอายุ
      router.push('/login');
      return;
    }
    
    // แปลงข้อมูลจาก JSON string เป็น JavaScript Object
    const userData = JSON.parse(storedUser);
    setUser(userData); // เก็บข้อมูลใน state
  }, [router]);

  /**
   * ฟังก์ชันสำหรับออกจากระบบ
   * ลบข้อมูลผู้ใช้จาก localStorage และกลับไปหน้า login
   */
  const handleLogout = () => {
    localStorage.removeItem('user'); // ลบ session ของผู้ใช้
    router.push('/login');          // กลับไปหน้า login
  };

  // แสดง Loading Spinner ขณะที่รอข้อมูลผู้ใช้จาก localStorage
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {/* Loading Spinner */}
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // แสดงหน้า Dashboard หลังจากโหลดข้อมูลผู้ใช้เสร็จ
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar ด้านบน */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* หัวข้อ Dashboard */}
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Dashboard
              </h1>
            </div>
            {/* ข้อมูลผู้ใช้และปุ่ม logout */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                สวัสดี, {user.email} {/* แสดงอีเมลของผู้ใช้ */}
              </span>
              <button
                onClick={handleLogout} // เรียกฟังก์ชัน logout
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                ออกจากระบบ
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* เนื้อหาหลัก */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Card หลักแสดงข้อมูลสำเร็จ */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              {/* ข้อความสำเร็จ */}
              <div className="text-center">
                {/* ไอคอน checkmark สีเขียว */}
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <svg
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7" // รูป checkmark
                    />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg leading-6 font-medium text-gray-900">
                  เข้าสู่ระบบสำเร็จ!
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  คุณได้ผ่านการยืนยันตัวตนแบบ 2FA เรียบร้อยแล้ว
                </p>
              </div>

              {/* แสดงข้อมูลผู้ใช้ในรูปแบบตาราง */}
              <div className="mt-8 bg-gray-50 rounded-lg p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  ข้อมูลผู้ใช้
                </h4>
                {/* Grid layout สำหรับแสดงข้อมูล */}
                <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      ID {/* User ID จากฐานข้อมูล */}
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {user.id}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      อีเมล {/* อีเมลที่ลงทะเบียน */}
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {user.email}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      วันที่สร้างบัญชี {/* วันที่ลงทะเบียน */}
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(user.createdAt).toLocaleDateString('th-TH')} {/* แปลงวันที่เป็นรูปแบบไทย */}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      อัปเดตล่าสุด {/* วันที่แก้ไขข้อมูลล่าสุด */}
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(user.updatedAt).toLocaleDateString('th-TH')} {/* แปลงวันที่เป็นรูปแบบไทย */}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* ข้อความสำเร็จสุดท้าย */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  🎉 ระบบ Face 2FA Login ทำงานสมบูรณ์!
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}