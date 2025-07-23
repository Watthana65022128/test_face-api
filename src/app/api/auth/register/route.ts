// ไฟล์นี้จัดการการลงทะเบียนผู้ใช้ใหม่ในระบบ
// เป็น API endpoint ที่รับข้อมูล email และ password แล้วสร้างบัญชีใหม่

import { NextRequest, NextResponse } from 'next/server'; // Next.js functions สำหรับจัดการ HTTP request และ response
import bcrypt from 'bcryptjs'; // ไลบรารีสำหรับเข้ารหัสรหัสผ่านให้ปลอดภัย
import { prisma } from '@/app/lib/prisma'; // เชื่อมต่อกับฐานข้อมูล PostgreSQL ผ่าน Prisma ORM

// ฟังก์ชัน POST สำหรับลงทะเบียนผู้ใช้ใหม่
// จะถูกเรียกเมื่อมีการส่ง POST request มาที่ /api/auth/register
export async function POST(request: NextRequest) {
  try {
    // ดึงข้อมูล email และ password จาก request body
    const { email, password } = await request.json();

    // ตรวจสอบว่ามีการส่ง email และ password มาหรือไม่
    // ถ้าไม่มีจะส่ง error 400 (Bad Request) กลับไป
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // ตรวจสอบในฐานข้อมูลว่า email นี้มีคนใช้แล้วหรือยัง
    // ใช้ findUnique เพื่อค้นหาผู้ใช้ที่มี email ตรงกัน
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    // ถ้าเจอ email ซ้ำในระบบแล้ว จะส่ง error 409 (Conflict) กลับไป
    // เพื่อป้องกันไม่ให้มีบัญชีซ้ำ
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      );
    }

    // เข้ารหัสรหัสผ่านด้วย bcrypt เพื่อความปลอดภัย
    // เลข 10 คือ salt rounds (ความแรงของการเข้ารหัส)
    const hashedPassword = await bcrypt.hash(password, 10);

    // สร้างผู้ใช้ใหม่ในฐานข้อมูล
    // บันทึก email และรหัสผ่านที่เข้ารหัสแล้ว
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword
      }
    });

    // ลบ password ออกจากข้อมูลที่จะส่งกลับไปหา client
    // เพื่อความปลอดภัย ไม่ควรส่งรหัสผ่านกลับไป
    const { password: _, ...userWithoutPassword } = user;

    // ส่งผลลัพธ์สำเร็จกลับไป พร้อมข้อมูลผู้ใช้ (ไม่มีรหัสผ่าน)
    // status 201 หมายถึง Created (สร้างสำเร็จ)
    return NextResponse.json({
      message: 'User registered successfully',
      user: userWithoutPassword
    }, { status: 201 });

  } catch (error) {
    // จัดการ error ที่อาจเกิดขึ้น เช่น database connection ผิดพลาด
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 } // status 500 หมายถึง Internal Server Error
    );
  }
}