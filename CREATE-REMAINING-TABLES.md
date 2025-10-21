# 🗄️ สร้างตารางที่เหลือใน Supabase

## ตารางที่ต้องสร้างเพิ่มเติม

### 1. เข้าไปที่ Supabase Dashboard
- URL: https://supabase.com/dashboard
- เลือกโปรเจค: `rxlmkbwpfruzzvnlgqtr`

### 2. ไปที่ SQL Editor
- คลิก "SQL Editor" ในเมนูซ้าย
- คลิก "New query"

### 3. รัน SQL นี้เพื่อสร้างตารางที่เหลือ:

```sql
-- สร้างตาราง categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
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
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- เปิดใช้งาน RLS (Row Level Security)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- สร้าง policies สำหรับ categories
CREATE POLICY "Anyone can view categories" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create categories" ON categories
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- สร้าง policies สำหรับ posts
CREATE POLICY "Anyone can view published posts" ON posts
  FOR SELECT USING (status = 'published');

CREATE POLICY "Authenticated users can create posts" ON posts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- เพิ่มข้อมูลตัวอย่าง
INSERT INTO categories (name, description) VALUES
('Technology', 'Technology related posts'),
('Lifestyle', 'Lifestyle and personal posts'),
('Tutorial', 'Tutorial and how-to posts');

INSERT INTO posts (title, content, excerpt, author_id, category_id, status) VALUES
('Welcome to My Blog', 'This is the first post on my blog...', 'Welcome message', 
 (SELECT id FROM users LIMIT 1), 
 (SELECT id FROM categories WHERE name = 'Technology' LIMIT 1), 
 'published');
```

### 4. คลิก "Run" เพื่อรัน SQL

### 5. ทดสอบ API อีกครั้ง
```bash
# ทดสอบ categories
curl http://localhost:4001/categories

# ทดสอบ posts
curl http://localhost:4001/posts
```

## หลังจากสร้างตารางแล้ว
- ✅ Categories API จะทำงานได้
- ✅ Posts API จะทำงานได้
- ✅ ข้อมูลจะถูกบันทึกใน database จริง
