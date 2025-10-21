
# 🔧 แก้ไขปัญหา RLS Policies ใน Supabase

## ปัญหา
- ✅ API ทำงานได้
- ✅ Supabase เชื่อมต่อได้
- ❌ ข้อมูลไม่เข้า database
- ❌ อาจมีปัญหา RLS (Row Level Security)

## วิธีแก้ไข

### 1. เข้าไปที่ Supabase Dashboard
- URL: https://supabase.com/dashboard
- เลือกโปรเจค: `rxlmkbwpfruzzvnlgqtr`

### 2. ไปที่ SQL Editor
- คลิก "SQL Editor" ในเมนูซ้าย
- คลิก "New query"

### 3. รัน SQL นี้เพื่อแก้ไข RLS Policies:

```sql
-- ลบ policies เก่า (ถ้ามี)
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Anyone can insert users" ON users;

-- สร้าง policies ใหม่
CREATE POLICY "Anyone can insert users" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view users" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- ตรวจสอบ RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'users';
```

### 4. คลิก "Run" เพื่อรัน SQL

### 5. ทดสอบ API อีกครั้ง
```bash
curl -X POST http://localhost:4001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@gmail.com","password":"password123","username":"testuser","name":"Test User"}'
```

### 6. ตรวจสอบใน Supabase Dashboard
- ไปที่ "Table Editor"
- เลือกตาราง `users`
- ตรวจสอบว่ามีข้อมูล user ที่สร้างขึ้น

## หมายเหตุ
- RLS policies อาจบล็อกการ insert ข้อมูล
- หลังจากแก้ไข policies แล้ว ข้อมูลจะเข้า database ได้
- ตรวจสอบว่า policies ถูกต้อง
