# 🔧 แก้ไขตาราง users ใน Supabase

## ปัญหา
- ✅ ตาราง `users` มีอยู่แล้ว
- ❌ ตาราง `users` ไม่มี column `email`
- ❌ API ไม่สามารถบันทึกข้อมูลได้

## วิธีแก้ไข

### 1. เข้าไปที่ Supabase Dashboard
- URL: https://supabase.com/dashboard
- เลือกโปรเจค: `rxlmkbwpfruzzvnlgqtr`

### 2. ไปที่ SQL Editor
- คลิก "SQL Editor" ในเมนูซ้าย
- คลิก "New query"

### 3. รัน SQL นี้เพื่อแก้ไขตาราง:

```sql
-- ลบตาราง users เก่า (ถ้ามี)
DROP TABLE IF EXISTS users;

-- สร้างตาราง users ใหม่พร้อม columns ที่ถูกต้อง
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

### 4. คลิก "Run" เพื่อรัน SQL

### 5. ตรวจสอบตาราง
- ไปที่ "Table Editor"
- เลือกตาราง `users`
- ตรวจสอบว่ามี columns: `id`, `username`, `name`, `email`, `role`, `profile_pic`, `created_at`, `updated_at`

## หลังจากแก้ไขแล้ว
- ✅ API จะสามารถบันทึกข้อมูลลงใน database ได้
- ✅ Login จะดึงข้อมูลจาก database ได้
- ✅ ข้อมูลจะไม่หายไป
