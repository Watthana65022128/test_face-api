# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Face 2FA Login system built with Next.js 15, implementing facial recognition for two-factor authentication. The project uses:

- **Next.js 15** with App Router and TypeScript
- **Prisma** with PostgreSQL for database management
- **Supabase** for additional authentication services
- **TailwindCSS** for styling
- **face-api.js** for facial recognition and biometric processing
- **bcryptjs** for password hashing

## API Endpoints

### Authentication APIs
- `POST /api/auth/register` - ลงทะเบียนผู้ใช้ด้วย email/password
- `POST /api/auth/register-face` - ลงทะเบียน face descriptor สำหรับ 2FA
- `POST /api/auth/login` - เข้าสู่ระบบด้วย email/password
- `POST /api/auth/verify-face` - ยืนยันตัวตนด้วยใบหน้า (Face 2FA)

## Development Commands

- **Start development server**: `npm run dev` (runs on http://localhost:3000)
- **Build for production**: `npm run build`
- **Start production server**: `npm start`
- **Lint code**: `npm run lint`

## Database Management

- **Database ORM**: Prisma with PostgreSQL
- **Schema location**: `prisma/schema.prisma`
- **Migration commands**: Use standard Prisma CLI commands (`npx prisma migrate dev`, `npx prisma db push`, etc.)
- **Database client**: Available as `prisma` export from `src/app/lib/prisma.ts`

## Architecture

### Database Schema
- **User model**: Stores user credentials and face biometric data (`faceData` field stores face descriptors as JSON)
- **Environment variables required**: `DATABASE_URL`, `DIRECT_URL` for database connection

### Authentication Services
- **Dual setup**: Both Prisma (primary database) and Supabase (additional auth services)
- **Supabase client**: Available from `src/app/lib/supabase.ts`
- **Required env vars**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### File Structure
- **App directory**: `src/app/` (Next.js 15 App Router)
- **Library utilities**: `src/app/lib/` (database clients and utilities)
- **Path aliases**: `@/*` maps to `./src/*`

## TypeScript Configuration
- **Target**: ES2017
- **Strict mode enabled**
- **Next.js plugin configured**
- **Path mapping**: `@/*` for `./src/*` imports