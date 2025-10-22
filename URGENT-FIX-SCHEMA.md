# 🚨 แก้ไขปัญหา Schema Cache ทันที!

## ปัญหาปัจจุบัน
- ✅ Frontend login ได้และไม่เด้งออก
- ❌ ข้อมูลไม่ถูกบันทึกใน Supabase database
- ❌ Error: "Could not find the 'email' column of 'users' in the schema cache"

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
-- ลบตาราง users เก่า (ถ้ามี)
DROP TABLE IF EXISTS users CASCADE;

-- สร้างตาราง users ใหม่
CREATE TABLE users (
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

### 5. รอ 1 นาที
- รอให้ Supabase อัปเดต schema cache

### 6. ทดสอบ API
```bash
curl -X POST http://localhost:4001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@gmail.com","password":"password123","username":"testuser","name":"Test User"}'
```

## หลังจากแก้ไขแล้ว
- ✅ ข้อมูลจะถูกบันทึกใน database จริง
- ✅ Login จะดึงข้อมูลจาก database ได้
- ✅ ข้อมูลจะไม่หายไป

## หมายเหตุ
- ต้องทำขั้นตอนนี้ก่อน API จะทำงานได้สมบูรณ์
- หลังจากรัน SQL แล้ว ต้องรอให้ Supabase อัปเดต schema cache
