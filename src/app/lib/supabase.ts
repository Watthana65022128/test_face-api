// ไฟล์นี้จัดการการเชื่อมต่อกับ Supabase สำหรับบริการ authentication เสริม
// ในโครงการนี้ใช้ Prisma เป็นหลัก แต่ Supabase อาจใช้สำหรับฟีเจอร์อื่นๆ ในอนาคต

import { createClient } from '@supabase/supabase-js' // Import Supabase client library

// ดึงค่า environment variables สำหรับการเชื่อมต่อ Supabase
// ! ท้าย variable หมายถึงเรามั่นใจว่าตัวแปรนี้มีค่าแน่นอน (non-null assertion)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL! // URL ของ Supabase project
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // Anonymous key สำหรับ client-side

// สร้าง Supabase client instance และ export ออกไปให้ component อื่นใช้
// client นี้จะใช้สำหรับ authentication, database queries, file storage และบริการอื่นๆ ของ Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)