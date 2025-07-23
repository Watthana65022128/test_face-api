'use client';

// Component สำหรับลงทะเบียนใบหน้าสำหรับ 2FA (Face Registration)
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as faceapi from 'face-api.js';
import { loadFaceApiModels } from '@/app/lib/face-api';

export default function RegisterFacePage() {
  // References สำหรับ DOM elements
  const videoRef = useRef<HTMLVideoElement>(null);    // วิดีโอจากกล้อง
  const canvasRef = useRef<HTMLCanvasElement>(null);  // canvas สำหรับวาดผลลัพธ์
  
  // State variables สำหรับจัดการสถานะของ component
  const [modelsLoaded, setModelsLoaded] = useState(false);  // สถานะการโหลด ML models
  const [capturing, setCapturing] = useState(false);       // กำลังเปิดกล้องหรือไม่
  const [loading, setLoading] = useState(false);           // กำลังประมวลผลหรือไม่  
  const [error, setError] = useState('');                  // ข้อความ error
  const [message, setMessage] = useState('');              // ข้อความสำเร็จ
  const [userId, setUserId] = useState<string | null>(null); // ID ของผู้ใช้
  const router = useRouter();

  // useEffect - ทำงานเมื่อ component ถูก mount
  useEffect(() => {
    // ตรวจสอบว่าผู้ใช้ลงทะเบียนแล้วหรือยัง
    const storedUserId = localStorage.getItem('userId');
    if (!storedUserId) {
      // ถ้ายังไม่ลงทะเบียน ให้ไปหน้า register ก่อน
      router.push('/register');
      return;
    }
    setUserId(storedUserId);
    loadModels(); // โหลด ML models
  }, [router]);

  /**
   * ฟังก์ชันสำหรับโหลด Machine Learning Models
   * จำเป็นสำหรับการทำ Face Detection และ Face Recognition
   */
  const loadModels = async () => {
    try {
      const success = await loadFaceApiModels();
      if (success) {
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
   * ฟังก์ชันสำหรับเปิดกล้องและแสดงวิดีโอ
   * ใช้ navigator.mediaDevices.getUserMedia() เพื่อขอสิทธิ์เข้าถึงกล้อง
   */
  const startVideo = async () => {
    try {
      // ขอสิทธิ์เข้าถึงกล้อง (video only)
      const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
      if (videoRef.current) {
        videoRef.current.srcObject = stream; // เชื่อม stream เข้ากับ video element
        setCapturing(true); // อัพเดทสถานะ
      }
    } catch (error) {
      setError('ไม่สามารถเข้าถึงกล้องได้');
      console.error('Camera access error:', error);
    }
  };

  /**
   * ฟังก์ชันสำหรับปิดกล้องและหยุดการแสดงวิดีโอ
   * หยุด media tracks ทั้งหมดเพื่อปลดปล่อย resource
   */
  const stopVideo = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      // หา media tracks ทั้งหมดใน stream
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      // หยุดทุก track (ปิดกล้อง)
      tracks.forEach(track => track.stop());
      setCapturing(false); // อัพเดทสถานะ
    }
  };

  /**
   * ฟังก์ชันหลักสำหรับจับภาพใบหน้าและลงทะเบียน Face 2FA
   * 
   * ขั้นตอนการทำงาน:
   * 1. ตรวจจับใบหน้าในภาพจากกล้อง
   * 2. สกัด Face Descriptor (ข้อมูลลักษณะใบหน้า)
   * 3. วาดกรอบและจุดสำคัญบน Canvas
   * 4. ส่งข้อมูลไปบันทึกใน Database
   */
  const captureFace = async () => {
    // ตรวจสอบว่าทุก element พร้อมใช้งานแล้ว
    if (!videoRef.current || !canvasRef.current || !modelsLoaded || !userId) {
      return;
    }

    setLoading(true);  // เริ่มสถานะ loading
    setError('');      // ล้าง error เก่า

    try {
      // ขั้นตอนที่ 1-2: ตรวจจับใบหน้าและสกัดข้อมูล
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions()) // หาใบหน้า
        .withFaceLandmarks()    // หาจุดสำคัญ 68 จุด  
        .withFaceDescriptor();  // สกัด descriptor 128 มิติ

      // ถ้าไม่เจอใบหน้า
      if (!detection) {
        setError('ไม่พบใบหน้าในภาพ กรุณาลองใหม่');
        setLoading(false);
        return;
      }

      // ขั้นตอนที่ 3: วาดผลลัพธ์บน canvas
      const canvas = canvasRef.current;
      const displaySize = { width: videoRef.current.width, height: videoRef.current.height };
      faceapi.matchDimensions(canvas, displaySize); // ปรับขนาด canvas

      const resizedDetections = faceapi.resizeResults(detection, displaySize);
      canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height); // ล้าง canvas
      faceapi.draw.drawDetections(canvas, [resizedDetections]);     // วาดกรอบใบหน้า
      faceapi.draw.drawFaceLandmarks(canvas, [resizedDetections]);  // วาดจุดสำคัญ

      // ขั้นตอนที่ 4: ส่งข้อมูล Face Descriptor ไปบันทึกใน Database
      const response = await fetch('/api/auth/register-face', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,  // ID ของผู้ใช้
          faceDescriptor: Array.from(detection.descriptor), // แปลง descriptor เป็น array
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // ลงทะเบียนสำเร็จ
        setMessage('ลงทะเบียนใบหน้าสำเร็จ!');
        stopVideo(); // ปิดกล้อง
        
        // รอ 2 วินาที แล้วไปหน้า login
        setTimeout(() => {
          localStorage.removeItem('userId'); // ลบข้อมูลใน localStorage
          router.push('/login');
        }, 2000);
      } else {
        // ลงทะเบียนล้มเหลว
        setError(data.error || 'เกิดข้อผิดพลาดในการลงทะเบียนใบหน้า');
      }
    } catch (error) {
      // หากเกิด error ในขั้นตอนใดขั้นตอนหนึ่ง
      setError('เกิดข้อผิดพลาดในการประมวลผลภาพ');
      console.error('Face capture error:', error);
    } finally {
      setLoading(false); // ปิดสถานะ loading ในทุกกรณี
    }
  };

  /**
   * ฟังก์ชันสำหรับข้าม Face Registration
   * ผู้ใช้สามารถเข้าสู่ระบบแบบธรรมดา (แค่ email/password) ได้
   */
  const skipFaceRegistration = () => {
    localStorage.removeItem('userId'); // ลบข้อมูลใน localStorage
    router.push('/login');             // ไปหน้า login
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            ลงทะเบียนใบหน้า
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            สำหรับการยืนยันตัวตน 2FA
          </p>
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
                  onClick={captureFace}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  ถ่ายภาพใบหน้า
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
                กำลังประมวลผล...
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}