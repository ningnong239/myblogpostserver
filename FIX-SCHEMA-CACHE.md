# 🔧 แก้ไขปัญหา Schema Cache ใน Supabase

## ปัญหา
- ✅ Login ทำงานได้และไม่เด้งออก
- ❌ ข้อมูลไม่ถูกบันทึกใน Supabase database
- ❌ Error: "Could not find the 'email' column of 'users' in the schema cache"

## วิธีแก้ไข

### 1. เข้าไปที่ Supabase Dashboard
- URL: https://supabase.com/dashboard
- เลือกโปรเจค: `rxlmkbwpfruzzvnlgqtr`

### 2. ไปที่ SQL Editor
- คลิก "SQL Editor" ในเมนูซ้าย
- คลิก "New query"

### 3. รัน SQL นี้เพื่อรีเฟรช Schema Cache:

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

-- รีเฟรช schema cache
NOTIFY pgrst, 'reload schema';
```

### 4. คลิก "Run" เพื่อรัน SQL

### 5. รอ 30 วินาที
- รอให้ Supabase อัปเดต schema cache

### 6. ทดสอบ API อีกครั้ง
```bash
curl -X POST http://localhost:4001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@gmail.com","password":"password123","username":"testuser","name":"Test User"}'
```

## หมายเหตุ
- หลังจากรัน SQL แล้ว ต้องรอให้ Supabase อัปเดต schema cache
- ข้อมูลจะถูกบันทึกใน database จริง
- Login จะดึงข้อมูลจาก database ได้
