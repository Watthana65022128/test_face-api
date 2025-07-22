import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { userId, faceDescriptor } = await request.json();

    if (!userId || !faceDescriptor) {
      return NextResponse.json(
        { error: 'User ID and face descriptor are required' },
        { status: 400 }
      );
    }

    // ตรวจสอบว่าผู้ใช้มีอยู่จริง
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // บันทึก face descriptor
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        faceData: JSON.stringify(faceDescriptor)
      }
    });

    return NextResponse.json({
      message: 'Face data registered successfully',
      userId: updatedUser.id
    }, { status: 200 });

  } catch (error) {
    console.error('Face registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}