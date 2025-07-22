'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as faceapi from 'face-api.js';

export default function RegisterFacePage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (!storedUserId) {
      router.push('/register');
      return;
    }
    setUserId(storedUserId);
    loadModels();
  }, [router]);

  const loadModels = async () => {
    const MODEL_URL = '/models';
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
      setModelsLoaded(true);
    } catch (error) {
      setError('ไม่สามารถโหลดโมเดล Face API ได้');
      console.error('Model loading error:', error);
    }
  };

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCapturing(true);
      }
    } catch (error) {
      setError('ไม่สามารถเข้าถึงกล้องได้');
      console.error('Camera access error:', error);
    }
  };

  const stopVideo = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      setCapturing(false);
    }
  };

  const captureFace = async () => {
    if (!videoRef.current || !canvasRef.current || !modelsLoaded || !userId) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setError('ไม่พบใบหน้าในภาพ กรุณาลองใหม่');
        setLoading(false);
        return;
      }

      // วาดผลลัพธ์บน canvas
      const canvas = canvasRef.current;
      const displaySize = { width: videoRef.current.width, height: videoRef.current.height };
      faceapi.matchDimensions(canvas, displaySize);

      const resizedDetections = faceapi.resizeResults(detection, displaySize);
      canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
      faceapi.draw.drawDetections(canvas, [resizedDetections]);
      faceapi.draw.drawFaceLandmarks(canvas, [resizedDetections]);

      // ส่ง face descriptor ไป API
      const response = await fetch('/api/auth/register-face', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          faceDescriptor: Array.from(detection.descriptor),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('ลงทะเบียนใบหน้าสำเร็จ!');
        stopVideo();
        
        setTimeout(() => {
          localStorage.removeItem('userId');
          router.push('/login');
        }, 2000);
      } else {
        setError(data.error || 'เกิดข้อผิดพลาดในการลงทะเบียนใบหน้า');
      }
    } catch (error) {
      setError('เกิดข้อผิดพลาดในการประมวลผลภาพ');
      console.error('Face capture error:', error);
    } finally {
      setLoading(false);
    }
  };

  const skipFaceRegistration = () => {
    localStorage.removeItem('userId');
    router.push('/login');
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

          <div className="mt-4 text-center">
            <button
              onClick={skipFaceRegistration}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              ข้ามการลงทะเบียนใบหน้า (สามารถทำได้ภายหลัง)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}