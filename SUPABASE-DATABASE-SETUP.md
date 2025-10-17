# 🗄️ Supabase Database Setup

## สร้างตาราง users ใน Supabase

### 1. เข้าไปที่ Supabase Dashboard
- URL: https://supabase.com/dashboard
- เลือกโปรเจค: `rxlmkbwpfruzzvnlgqtr`

### 2. ไปที่ SQL Editor
- คลิก "SQL Editor" ในเมนูซ้าย
- คลิก "New query"

### 3. รัน SQL Script นี้:

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

-- สร้างตาราง posts
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image TEXT,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID,
  status VARCHAR(20) DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- สร้างตาราง categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- เปิดใช้งาน RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- สร้าง policies สำหรับ users
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- สร้าง policies สำหรับ posts
CREATE POLICY "Anyone can view published posts" ON posts
  FOR SELECT USING (status = 'published');

CREATE POLICY "Authenticated users can create posts" ON posts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- สร้าง policies สำหรับ categories
CREATE POLICY "Anyone can view categories" ON categories
  FOR SELECT USING (true);
```

### 4. คลิก "Run" เพื่อรัน SQL script

### 5. ตรวจสอบตาราง
- ไปที่ "Table Editor"
- ตรวจสอบว่ามีตาราง users, posts, categories

## หมายเหตุ
หลังจากสร้างตารางแล้ว API จะสามารถบันทึกข้อมูลลงใน Supabase database ได้
