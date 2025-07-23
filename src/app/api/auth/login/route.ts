// ไฟล์นี้จัดการการเข้าสู่ระบบของผู้ใช้
// ตรวจสอบ email/password และแจ้งว่าต้องยืนยันใบหน้าหรือไม่

import { NextRequest, NextResponse } from 'next/server'; // Next.js functions สำหรับ HTTP
import bcrypt from 'bcryptjs'; // สำหรับตรวจสอบรหัสผ่านที่เข้ารหัสแล้ว
import { prisma } from '@/app/lib/prisma'; // เชื่อมต่อฐานข้อมูล

// ฟังก์ชัน POST สำหรับการเข้าสู่ระบบ
// จะถูกเรียกเมื่อมีการส่ง POST request มาที่ /api/auth/login
export async function POST(request: NextRequest) {
  try {
    // ดึงข้อมูล email และ password จาก request body
    const { email, password } = await request.json();

    // ตรวจสอบว่ามีการส่งข้อมูลครบถ้วนหรือไม่
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 } // Bad Request
      );
    }

    // ค้นหาผู้ใช้ในฐานข้อมูลด้วย email
    // ใช้ findUnique เพราะ email เป็น unique field
    const user = await prisma.user.findUnique({
      where: { email }
    });

    // ถ้าไม่เจอผู้ใช้ในระบบ
    // ส่ง error แบบเดียวกับรหัสผ่านผิด เพื่อความปลอดภัย (ไม่บอกว่า email ไม่มี)
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 } // Unauthorized
      );
    }

    // เปรียบเทียบรหัสผ่านที่ผู้ใช้ส่งมา กับรหัสผ่านที่เข้ารหัสในฐานข้อมูล
    // bcrypt.compare จะ hash รหัสผ่านใหม่แล้วเปรียบเทียบ
    const isPasswordValid = await bcrypt.compare(password, user.password);

    // ถ้ารหัสผ่านไม่ถูกต้อง
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 } // Unauthorized
      );
    }

    // ตรวจสอบว่าผู้ใช้นี้ได้ลงทะเบียนใบหน้าไว้หรือยัง
    // !! เป็นการแปลงค่าเป็น boolean (null/undefined -> false, มีค่า -> true)
    const requiresFaceVerification = !!user.faceData;

    // ลบข้อมูลที่เป็นความลับออก (password และ faceData) 
    // เพื่อไม่ให้ส่งไปหา client
    const { password: _, faceData: __, ...userWithoutSensitiveData } = user;

    // ส่งผลลัพธ์กลับไป พร้อมบอกว่าต้องยืนยันใบหน้าหรือไม่
    // requiresFaceVerification จะเป็น true ถ้าผู้ใช้เคยลงทะเบียนใบหน้าไว้
    return NextResponse.json({
      message: 'Login successful',
      user: userWithoutSensitiveData,
      requiresFaceVerification // บอก client ว่าต้องทำ Face 2FA หรือไม่
    }, { status: 200 }); // OK

  } catch (error) {
    // จัดการ error ที่อาจเกิดขึ้น เช่น database connection ผิดพลาด
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 } // Internal Server Error
    );
  }
}