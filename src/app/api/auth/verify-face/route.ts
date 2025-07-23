// ไฟล์นี้จัดการยืนยันตัวตนด้วยใบหน้า (Face 2FA)
// เปรียบเทียบใบหน้าที่ถ่ายมากับใบหน้าที่ลงทะเบียนไว้

import { NextRequest, NextResponse } from 'next/server'; // Next.js functions
import { prisma } from '@/app/lib/prisma'; // เชื่อมต่อฐานข้อมูล

// ฟังก์ชัน POST สำหรับยืนยันตัวตนด้วยใบหน้า
// จะถูกเรียกจาก /api/auth/verify-face
export async function POST(request: NextRequest) {
  try {
    // ดึงข้อมูลจาก request: userId, faceDescriptor (ใบหน้าที่จะตรวจสอบ), threshold (ค่าความคล้ายคลึง)
    // threshold ค่า default คือ 0.6 (ยิ่งต่ำ = คล้ายคลึงมาก, ยิ่งสูง = คล้ายคลึงน้อย)
    const { userId, faceDescriptor, threshold = 0.6 } = await request.json();

    // ตรวจสอบว่ามีข้อมูลครบถ้วนหรือไม่
    if (!userId || !faceDescriptor) {
      return NextResponse.json(
        { error: 'User ID and face descriptor are required' },
        { status: 400 } // Bad Request
      );
    }

    // ค้นหาผู้ใช้และข้อมูลใบหน้าที่ลงทะเบียนไว้
    // ใช้ select เพื่อดึงเฉพาะ field ที่ต้องการเท่านั้น (ไม่ดึง password)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        faceData: true // ข้อมูลใบหน้าที่เก็บไว้
      }
    });

    // ถ้าไม่เจอผู้ใช้
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 } // Not Found
      );
    }

    // ตรวจสอบว่าผู้ใช้ได้ลงทะเบียนใบหน้าไว้หรือยัง
    if (!user.faceData) {
      return NextResponse.json(
        { error: 'No face data registered for this user' },
        { status: 400 } // Bad Request
      );
    }

    // แปลงข้อมูลใบหน้าที่เก็บไว้จาก JSON string กลับเป็น array ของตัวเลข
    const storedFaceDescriptor = JSON.parse(user.faceData);

    // คำนวณระยะทางระหว่างใบหน้า 2 ใบด้วย Euclidean Distance
    // ค่าที่ได้ยิ่งต่ำ = ใบหน้าคล้ายคลึงกันมาก
    const distance = calculateEuclideanDistance(faceDescriptor, storedFaceDescriptor);

    // เปรียบเทียบว่าระยะทางน้อยกว่าค่า threshold หรือไม่
    // ถ้าน้อยกว่า = ใบหน้าตรงกัน, ถ้ามากกว่า = ใบหน้าไม่ตรงกัน
    const isMatch = distance < threshold;

    // ส่งผลลัพธ์การยืนยันตัวตนกลับไป
    return NextResponse.json({
      verified: isMatch, // true = ยืนยันสำเร็จ, false = ยืนยันไม่สำเร็จ
      distance: distance, // ค่าระยะทางที่คำนวณได้
      threshold: threshold, // ค่า threshold ที่ใช้
      message: isMatch ? 'Face verification successful' : 'Face verification failed'
    }, { status: 200 }); // OK

  } catch (error) {
    // จัดการ error ที่อาจเกิดขึ้น เช่นการ parse JSON ผิดพลาด
    console.error('Face verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 } // Internal Server Error
    );
  }
}

// ฟังก์ชันคำนวณ Euclidean Distance ระหว่าง face descriptor 2 ตัว
// สูตร: รากที่สองของผลต่างกันของแต่ละจุด แล้วหารากที่สอง
function calculateEuclideanDistance(descriptor1: number[], descriptor2: number[]): number {
  // ตรวจสอบว่า array ทั้ง 2 ตัวมีขนาดเท่ากันหรือไม่
  if (descriptor1.length !== descriptor2.length) {
    throw new Error('Descriptors must have the same length');
  }

  // คำนวณผลรวมของกำลังสองของค่าความต่างแต่ละจุด
  let sum = 0;
  for (let i = 0; i < descriptor1.length; i++) {
    const diff = descriptor1[i] - descriptor2[i]; // หาความต่าง
    sum += diff * diff; // ยกกำลังสองแล้วบวกเข้าไปในผลรวม
  }

  // หารากที่สองของผลรวม (คือ Euclidean Distance)
  return Math.sqrt(sum);
}