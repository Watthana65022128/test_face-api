# 🔐 Face 2FA Login System

ระบบเข้าสู่ระบบแบบ Two-Factor Authentication (2FA) ด้วยการยืนยันใบหน้า โดยใช้ Face Recognition Technology

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-blue?style=for-the-badge&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## 🎯 คุณสมบัติหลัก

- **🔒 Two-Factor Authentication (2FA)**: ความปลอดภัยขั้นสูงด้วยการยืนยัน 2 ขั้นตอน
- **👤 Face Recognition**: ยืนยันตัวตนด้วยการสแกนใบหน้าผ่านกล้องเว็บแคม
- **🗃️ Database Integration**: เก็บข้อมูลผู้ใช้และ Face Descriptors ใน PostgreSQL
- **🎨 Modern UI**: สวยงามด้วย TailwindCSS และ Responsive Design
- **⚡ Real-time Processing**: ประมวลผลใบหน้าแบบ Real-time ด้วย face-api.js
- **🔐 Secure Password**: เข้ารหัสรหัสผ่านด้วย bcryptjs

## 🏗️ เทคโนโลยีที่ใช้

### Frontend & Backend
- **Next.js 15** - React Framework พร้อม App Router
- **TypeScript** - Type Safety สำหรับ JavaScript
- **TailwindCSS** - CSS Framework สำหรับ Styling

### Database & ORM
- **PostgreSQL** - Relational Database
- **Prisma** - Modern Database ORM
- **Supabase** - Backend-as-a-Service (เสริม)

### Face Recognition
- **face-api.js** - JavaScript Face Recognition Library
- **TinyFaceDetector** - โมเดล ML สำหรับตรวจจับใบหน้า
- **FaceLandmark68Net** - หาจุดสำคัญ 68 จุดบนใบหน้า
- **FaceRecognitionNet** - สกัด Face Descriptors (128 มิติ)

### Security
- **bcryptjs** - Password Hashing
- **Euclidean Distance** - วัดความคล้ายคลึงของใบหน้า

## 🚀 การติดตั้งและเริ่มใช้งาน

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/face-2fa-login.git
cd face-2fa-login
```

### 2. ติดตั้ง Dependencies
```bash
npm install
```

### 3. ตั้งค่า Environment Variables
สร้างไฟล์ `.env.local` และเพิ่ม:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/face_2fa_db"
DIRECT_URL="postgresql://username:password@localhost:5432/face_2fa_db"

# Supabase (ถ้าใช้)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

### 4. ตั้งค่า Database
```bash
# สร้าง Database และ Tables
npx prisma migrate dev

# (หรือ) Push Schema ไป Database
npx prisma db push

# ดู Database ใน Prisma Studio
npx prisma studio
```

### 5. รันโปรเจค
```bash
# Development Mode
npm run dev

# Production Build
npm run build
npm start
```

เปิดเบราว์เซอร์ไปที่ [http://localhost:3000](http://localhost:3000)

## 📱 วิธีใช้งาน

### ขั้นตอนการลงทะเบียน
1. **ลงทะเบียนบัญชี**: กรอก Email และ Password
2. **ลงทะเบียนใบหน้า**: ถ่ายภาพใบหน้าผ่านกล้องเว็บแคม
3. **บันทึกข้อมูล**: ระบบจะสกัด Face Descriptors และบันทึกในฐานข้อมูล

### ขั้นตอนการเข้าสู่ระบบ
1. **เข้าสู่ระบบ**: กรอก Email และ Password (ขั้นตอนที่ 1)
2. **ยืนยันใบหน้า**: สแกนใบหน้าผ่านกล้องเว็บแคม (ขั้นตอนที่ 2)
3. **เข้าสู่ Dashboard**: หากยืนยันตัวตนสำเร็จ

## 🏛️ สถาปัตยกรรมระบบ

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Routes    │    │   Database      │
│   (Next.js)     │───▶│   (Next.js)     │───▶│   (PostgreSQL)  │
│                 │    │                 │    │                 │
│ • React Pages   │    │ • /auth/login   │    │ • User Table    │
│ • Face Camera   │    │ • /auth/register│    │ • Face Data     │
│ • TailwindCSS   │    │ • /register-face│    │ • Prisma ORM    │
│                 │    │ • /verify-face  │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│   face-api.js   │    │   Security      │
│                 │    │                 │
│ • Face Detection│    │ • bcryptjs      │
│ • ML Models     │    │ • Password Hash │
│ • Descriptors   │    │ • 2FA Logic     │
└─────────────────┘    └─────────────────┘
```

## 📂 โครงสร้างโปรเจค

```
src/app/
├── api/auth/              # API Endpoints
│   ├── login/route.ts     # เข้าสู่ระบบ (ขั้นตอนที่ 1)
│   ├── register/route.ts  # ลงทะเบียนผู้ใช้
│   ├── register-face/     # ลงทะเบียนใบหน้า
│   └── verify-face/       # ยืนยันใบหน้า (ขั้นตอนที่ 2)
├── lib/                   # Utilities
│   ├── prisma.ts         # Database Client
│   ├── supabase.ts       # Supabase Client
│   └── face-api.ts       # Face Recognition Functions
├── dashboard/             # หน้าหลังเข้าสู่ระบบ
├── login/                 # หน้าเข้าสู่ระบบ
├── register/              # หน้าลงทะเบียน
├── register-face/         # หน้าลงทะเบียนใบหน้า
├── verify-face/           # หน้ายืนยันใบหน้า
├── layout.tsx            # Root Layout
└── page.tsx              # หน้าแรก
```

## 🔬 วิทยาศาสตร์เบื้องหลัง Face Recognition

### 1. Face Detection
ใช้ **TinyFaceDetector** หาพิกัดใบหน้าในภาพ

### 2. Face Landmarks
ใช้ **FaceLandmark68Net** หาจุดสำคัญ 68 จุด (ตา, จมูก, ปาก, ใบหน้า)

### 3. Face Descriptors
ใช้ **FaceRecognitionNet** แปลงใบหน้าเป็น Vector 128 มิติ

### 4. Face Matching
เปรียบเทียบใบหน้า 2 ใบด้วย **Euclidean Distance**:
```javascript
distance = √Σ(descriptor1[i] - descriptor2[i])²
```
- Distance < 0.6 = ใบหน้าตรงกัน ✅
- Distance ≥ 0.6 = ใบหน้าไม่ตรงกัน ❌

## 🗄️ Database Schema

```sql
-- User Table
CREATE TABLE User (
  id          String   @id @default(cuid())
  email       String   @unique
  password    String   -- bcrypt hashed
  faceData    String?  -- JSON Face Descriptors
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
)
```

## 🔧 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | ลงทะเบียนผู้ใช้ใหม่ |
| `POST` | `/api/auth/login` | เข้าสู่ระบบ (ขั้นตอนที่ 1) |
| `POST` | `/api/auth/register-face` | ลงทะเบียนข้อมูลใบหน้า |
| `POST` | `/api/auth/verify-face` | ยืนยันตัวตนด้วยใบหน้า (ขั้นตอนที่ 2) |

## 🔐 ความปลอดภัย

- **Password Hashing**: bcryptjs พร้อม salt rounds 10
- **Face Data**: เก็บเป็น Descriptors ไม่ใช่รูปภาพจริง
- **Client-Side Processing**: ประมวลผลใบหน้าใน Browser
- **Secure Headers**: HTTP Security Headers
- **Environment Variables**: ข้อมูลสำคัญเก็บใน .env

## 🎯 การปรับแต่งและการพัฒนาต่อ

### เปลี่ยน Face Recognition Threshold
```javascript
// ในไฟล์ verify-face/route.ts
const threshold = 0.6; // ค่าเริ่มต้น
// 0.4 = เข้มงวดมาก (อาจเข้าใจผิด)
// 0.8 = หลวมมาก (อาจไม่ปลอดภัย)
```

### เพิ่มฟีเจอร์ใหม่
- **Multi-Face Support**: รองรับหลายใบหน้า
- **Liveness Detection**: ตรวจจับใบหน้าจริง vs รูปภาพ
- **Face Expression**: วิเคราะห์อารมณ์
- **Age/Gender Detection**: วิเคราะห์อายุและเพศ

## 🐛 การแก้ไขปัญหา

### กล้องไม่ทำงาน
```javascript
// ตรวจสอบ Permission
navigator.mediaDevices.getUserMedia({ video: true })
```

### โมเดล ML โหลดไม่ได้
```javascript
// ตรวจสอบ Network และ CORS
const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
```

### Face Detection ไม่เจอ
- ตรวจสอบแสง: ใช้แสงเพียงพอ
- ตรวจสอบมุมกล้อง: หันหน้าตรงกล้อง
- ตรวจสอบระยะ: อยู่ในระยะที่เหมาะสม

## 📊 การทดสอบและประสิทธิภาพ

### การรันการทดสอบ
```bash
# Unit Tests
npm run test

# E2E Tests  
npm run test:e2e

# Coverage
npm run test:coverage
```

### เครื่องมือ Development
```bash
# Lint Code
npm run lint

# Type Check
npm run type-check

# Format Code
npm run format
```

## 🚀 การ Deploy

### Vercel (แนะนำ)
```bash
# ติดตั้ง Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker
```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📜 License

MIT License - ดู [LICENSE](LICENSE) สำหรับรายละเอียด

## 🤝 การมีส่วนร่วม

1. Fork โปรเจค
2. สร้าง Feature Branch (`git checkout -b feature/amazing-feature`)
3. Commit การเปลี่ยนแปลง (`git commit -m 'Add amazing feature'`)
4. Push ไป Branch (`git push origin feature/amazing-feature`)
5. สร้าง Pull Request


