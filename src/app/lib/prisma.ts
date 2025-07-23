// ไฟล์นี้จัดการการเชื่อมต่อกับฐานข้อมูล PostgreSQL ผ่าน Prisma ORM
// ใช้ Singleton pattern เพื่อให้มีการสร้าง PrismaClient เพียงตัวเดียวใน application

import { PrismaClient } from '@prisma/client' // Import Prisma client

// สร้าง type สำหรับ global object เพื่อเก็บ PrismaClient instance
// ใช้เทคนิคนี้เพื่อป้องกันการสร้าง PrismaClient หลายตัวใน development mode
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// สร้าง PrismaClient instance แบบ Singleton
// ถ้ามี instance อยู่แล้วใน global จะใช้ตัวเดิม ถ้าไม่มีจะสร้างใหม่
// operator ?? (nullish coalescing) จะใช้ค่าขวามือเมื่อค่าซ้ายเป็น null หรือ undefined
export const prisma = globalForPrisma.prisma ?? new PrismaClient()

// ใน development mode เก็บ PrismaClient instance ไว้ใน global object
// เพื่อป้องกันการสร้าง connection ใหม่ทุกครั้งที่ hot reload (Next.js development feature)
// ใน production ไม่ต้องทำเพราะ server จะรันต่อเนื่อง ไม่มี hot reload
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma