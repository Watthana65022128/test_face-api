import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { userId, faceDescriptor, threshold = 0.6 } = await request.json();

    if (!userId || !faceDescriptor) {
      return NextResponse.json(
        { error: 'User ID and face descriptor are required' },
        { status: 400 }
      );
    }

    // หาผู้ใช้และ face data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        faceData: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.faceData) {
      return NextResponse.json(
        { error: 'No face data registered for this user' },
        { status: 400 }
      );
    }

    // Parse stored face descriptor
    const storedFaceDescriptor = JSON.parse(user.faceData);

    // คำนวณ Euclidean distance
    const distance = calculateEuclideanDistance(faceDescriptor, storedFaceDescriptor);

    // ตรวจสอบว่าระยะทางน้อยกว่า threshold หรือไม่
    const isMatch = distance < threshold;

    return NextResponse.json({
      verified: isMatch,
      distance: distance,
      threshold: threshold,
      message: isMatch ? 'Face verification successful' : 'Face verification failed'
    }, { status: 200 });

  } catch (error) {
    console.error('Face verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function calculateEuclideanDistance(descriptor1: number[], descriptor2: number[]): number {
  if (descriptor1.length !== descriptor2.length) {
    throw new Error('Descriptors must have the same length');
  }

  let sum = 0;
  for (let i = 0; i < descriptor1.length; i++) {
    const diff = descriptor1[i] - descriptor2[i];
    sum += diff * diff;
  }

  return Math.sqrt(sum);
}