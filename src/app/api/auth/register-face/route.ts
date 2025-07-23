// ไฟล์นี้จัดการลงทะเบียนข้อมูลใบหน้าของผู้ใช้
// เพื่อใช้ในการทำ Face 2FA (ยืนยันตัวตนด้วยใบหน้า)

import { NextRequest, NextResponse } from 'next/server'; // Next.js functions
import { prisma } from '@/app/lib/prisma'; // เชื่อมต่อฐานข้อมูล

// ฟังก์ชัน POST สำหรับลงทะเบียนข้อมูลใบหน้า
// จะถูกเรียกจาก /api/auth/register-face
export async function POST(request: NextRequest) {
  try {
    // ดึงข้อมูลจาก request: userId และ faceDescriptor (ข้อมูลใบหน้าที่แปลงเป็นตัวเลข)
    const { userId, faceDescriptor } = await request.json();

    // ตรวจสอบว่ามีข้อมูลครบถ้วนหรือไม่
    if (!userId || !faceDescriptor) {
      return NextResponse.json(
        { error: 'User ID and face descriptor are required' },
        { status: 400 } // Bad Request
      );
    }

    // ค้นหาผู้ใช้ในฐานข้อมูลด้วย userId ที่ส่งมา
    // เพื่อยืนยันว่าผู้ใช้นี้มีอยู่จริงในระบบ
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    // ถ้าไม่เจอผู้ใช้
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 } // Not Found
      );
    }

    // บันทึกข้อมูลใบหน้าลงในฐานข้อมูล
    // แปลง faceDescriptor (ที่เป็น array ของตัวเลข) เป็น JSON string เพื่อเก็บใน database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        faceData: JSON.stringify(faceDescriptor) // แปลง array เป็น JSON string
      }
    });

    // ส่งผลลัพธ์สำเร็จกลับไป
    return NextResponse.json({
      message: 'Face data registered successfully',
      userId: updatedUser.id
    }, { status: 200 }); // OK

  } catch (error) {
    // จัดการ error ที่อาจเกิดขึ้น
    console.error('Face registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 } // Internal Server Error
    );
  }
}