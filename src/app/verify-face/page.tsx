'use client';

// Component สำหรับยืนยันตัวตนด้วยใบหน้า (Face Verification) - ขั้นตอนที่ 2 ของ 2FA
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadFaceApiModels, detectFaceWithLandmarksAndDescriptor, drawDetectionResults } from '@/app/lib/face-api';

export default function VerifyFacePage() {
  // References สำหรับ DOM elements
  const videoRef = useRef<HTMLVideoElement>(null);    // วิดีโอจากกล้อง
  const canvasRef = useRef<HTMLCanvasElement>(null);  // canvas สำหรับแสดงผลลัพธ์
  
  // State variables สำหรับจัดการสถานะ
  const [modelsLoaded, setModelsLoaded] = useState(false);  // สถานะการโหลด ML models
  const [capturing, setCapturing] = useState(false);       // กำลังเปิดกล้องหรือไม่
  const [loading, setLoading] = useState(false);           // กำลังประมวลผลหรือไม่
  const [error, setError] = useState('');                  // ข้อความ error
  const [message, setMessage] = useState('');              // ข้อความแจ้งเตือน
  const [user, setUser] = useState<any>(null);             // ข้อมูลผู้ใช้ที่ต้องยืนยันตัวตน
  const router = useRouter();

  // useEffect - ทำงานเมื่อ component โหลดเสร็จ
  useEffect(() => {
    // ตรวจสอบว่าผู้ใช้ได้ login แล้วและต้องทำ Face 2FA หรือไม่
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      // ถ้าไม่มีข้อมูลผู้ใช้ ให้กลับไปหน้า login
      router.push('/login');
      return;
    }
    
    // แปลงข้อมูลผู้ใช้จาก JSON string เป็น object
    const userData = JSON.parse(storedUser);
    setUser(userData);
    loadModels(); // โหลด ML models สำหรับ Face Recognition
  }, [router]);

  /**
   * ฟังก์ชันสำหรับโหลด ML Models ที่จำเป็นสำหรับ Face Recognition
   * ใช้ฟังก์ชัน loadFaceApiModels จาก lib/face-api.ts
   */
  const loadModels = async () => {
    try {
      const loaded = await loadFaceApiModels();
      if (loaded) {
        setModelsLoaded(true); // โหลดสำเร็จ
      } else {
        setError('ไม่สามารถโหลดโมเดล Face API ได้');
      }
    } catch (error) {
      setError('ไม่สามารถโหลดโมเดล Face API ได้');
      console.error('Model loading error:', error);
    }
  };

  /**
   * ฟังก์ชันสำหรับเปิดกล้องและแสดงวิดีโอ live
   * ขอสิทธิ์เข้าถึงกล้องจากผู้ใช้และเชื่อมต่อกับ video element
   */
  const startVideo = async () => {
    try {
      // ขอสิทธิ์เข้าถึงกล้อง (video only, ไม่ต้องการเสียง)
      const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
      if (videoRef.current) {
        videoRef.current.srcObject = stream; // เชื่อม camera stream กับ video element
        setCapturing(true); // อัพเดทสถานะ
      }
    } catch (error) {
      setError('ไม่สามารถเข้าถึงกล้องได้');
      console.error('Camera access error:', error);
    }
  };

  /**
   * ฟังก์ชันสำหรับปิดกล้องและหยุดการแสดงวิดีโอ
   * ปลดปล่อย media resources เพื่อไม่ให้กล้องค้างเปิด
   */
  const stopVideo = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      // หา media tracks ทั้งหมดใน stream (video track)
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      // หยุดทุก track (ปิดกล้อง)
      tracks.forEach(track => track.stop());
      setCapturing(false); // อัพเดทสถานะ
    }
  };

  /**
   * ฟังก์ชันหลักสำหรับยืนยันตัวตนด้วยใบหน้า (Face 2FA)
   * 
   * ขั้นตอนการทำงาน:
   * 1. ตรวจจับใบหน้าในภาพจากกล้อง
   * 2. สกัด Face Descriptor จากใบหน้าที่เจอ
   * 3. วาดกรอบและจุดสำคัญบน Canvas
   * 4. ส่งข้อมูลไป API เพื่อเปรียบเทียบกับใบหน้าที่ลงทะเบียนไว้
   * 5. หากตรงกัน จะเข้าสู่ระบบสำเร็จ
   */
  const verifyFace = async () => {
    // ตรวจสอบว่าทุก element และข้อมูลพร้อมใช้งาน
    if (!videoRef.current || !canvasRef.current || !modelsLoaded || !user) {
      return;
    }

    setLoading(true);  // เริ่มสถานะ loading
    setError('');      // ล้าง error เก่า

    try {
      // ขั้นตอนที่ 1-2: ตรวจจับใบหน้าและสกัด Face Descriptor
      const detection = await detectFaceWithLandmarksAndDescriptor(videoRef.current);

      // ถ้าไม่เจอใบหน้าในภาพ
      if (!detection) {
        setError('ไม่พบใบหน้าในภาพ กรุณาลองใหม่');
        setLoading(false);
        return;
      }

      // ขั้นตอนที่ 3: วาดผลลัพธ์การตรวจจับบน canvas
      drawDetectionResults(canvasRef.current, videoRef.current, detection);

      // ขั้นตอนที่ 4: ส่ง Face Descriptor ไป API เพื่อเปรียบเทียบ
      const response = await fetch('/api/auth/verify-face', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id, // ID ของผู้ใช้
          faceDescriptor: Array.from(detection.descriptor), // แปลง descriptor เป็น array
        }),
      });

      const data = await response.json();

      // ขั้นตอนที่ 5: ตรวจสอบผลลัพธ์การยืนยัน
      if (response.ok && data.verified) {
        // ยืนยันตัวตนสำเร็จ
        setMessage('ยืนยันตัวตนสำเร็จ!');
        stopVideo(); // ปิดกล้อง
        
        // รอ 2 วินาที แล้วไปหน้า dashboard
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        // ยืนยันตัวตนไม่สำเร็จ (ใบหน้าไม่ตรงกัน)
        setError(data.message || 'การยืนยันใบหน้าไม่สำเร็จ กรุณาลองใหม่');
      }
    } catch (error) {
      // หากเกิด error ในขั้นตอนใดขั้นตอนหนึ่ง
      setError('เกิดข้อผิดพลาดในการประมวลผลภาพ');
      console.error('Face verification error:', error);
    } finally {
      setLoading(false); // ปิดสถานะ loading ในทุกกรณี
    }
  };

  /**
   * ฟังก์ชันสำหรับออกจากระบบ
   * ลบข้อมูลผู้ใช้ออกจาก localStorage และกลับไปหน้า login
   */
  const handleLogout = () => {
    localStorage.removeItem('user'); // ลบข้อมูลผู้ใช้
    router.push('/login');          // กลับไปหน้า login
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            ยืนยันตัวตนด้วยใบหน้า
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            ขั้นตอนสุดท้ายของการเข้าสู่ระบบ
          </p>
          {user && (
            <p className="mt-1 text-center text-sm text-gray-500">
              ผู้ใช้: {user.email}
            </p>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="relative">
            <video
              ref={videoRef}
              width="640"
              height="480"
              autoPlay
              muted
              className="w-full h-auto rounded-lg"
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full"
            />
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {message && (
            <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {message}
            </div>
          )}

          <div className="mt-6 flex space-x-4 justify-center">
            {!capturing && !message && (
              <button
                onClick={startVideo}
                disabled={!modelsLoaded}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {modelsLoaded ? 'เปิดกล้อง' : 'กำลังโหลดโมเดล...'}
              </button>
            )}

            {capturing && !loading && !message && (
              <>
                <button
                  onClick={verifyFace}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  ยืนยันใบหน้า
                </button>
                <button
                  onClick={stopVideo}
                  className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  หยุด
                </button>
              </>
            )}

            {loading && (
              <button
                disabled
                className="px-6 py-2 bg-gray-400 text-white rounded-md cursor-not-allowed"
              >
                กำลังยืนยัน...
              </button>
            )}
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={handleLogout}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              ออกจากระบบ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}