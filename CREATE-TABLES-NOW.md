# 🚨 สร้างตารางใน Supabase ทันที!

## ปัญหา
- ✅ Login ทำงานได้แล้ว
- ❌ ข้อมูล user ไม่เข้า Supabase database
- ❌ ตาราง `users` ยังไม่ได้สร้าง

## วิธีแก้ไข (ทำตามขั้นตอนนี้)

### 1. เข้าไปที่ Supabase Dashboard
- เปิดเบราว์เซอร์ไปที่: https://supabase.com/dashboard
- Login เข้าระบบ
- เลือกโปรเจค: `rxlmkbwpfruzzvnlgqtr`

### 2. ไปที่ SQL Editor
- คลิก **"SQL Editor"** ในเมนูซ้าย
- คลิก **"New query"**

### 3. Copy และ Paste SQL นี้:

```sql
-- สร้างตาราง users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(20) DEFAULT 'user',
  profile_pic TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- เปิดใช้งาน RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- สร้าง policies สำหรับ users
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can insert users" ON users
  FOR INSERT WITH CHECK (true);
```

### 4. รัน SQL
- คลิก **"Run"** (ปุ่มสีเขียว)
- รอให้เสร็จสิ้น

### 5. ตรวจสอบตาราง
- ไปที่ **"Table Editor"** ในเมนูซ้าย
- ตรวจสอบว่ามีตาราง `users` ปรากฏขึ้น

### 6. ทดสอบ API อีกครั้ง
หลังจากสร้างตารางแล้ว:
- Register จะบันทึกข้อมูลลงใน database
- Login จะดึงข้อมูลจาก database
- ข้อมูลจะไม่หายไป

## หมายเหตุ
- ต้องทำขั้นตอนนี้ก่อน API จะทำงานได้สมบูรณ์
- หลังจากสร้างตารางแล้ว ข้อมูลจะถูกบันทึกใน Supabase จริง
