# 🔧 แก้ไขปัญหา "Email address is invalid" ใน Supabase

## ปัญหา
API แสดง error: `"Email address is invalid"` เมื่อพยายาม register

## วิธีแก้ไข

### 1. ปิดการยืนยันอีเมลใน Supabase Dashboard

**ขั้นตอน:**
1. ไปที่ https://supabase.com/dashboard
2. เลือกโปรเจค: `rxlmkbwpfruzzvnlgqtr`
3. ไปที่ **Authentication** → **Settings**
4. หาส่วน **"User Signups"**
5. **ปิด "Confirm email"** (เปลี่ยนจากสีเขียวเป็นสีเทา)
6. คลิก **"Save changes"**

### 2. ตรวจสอบการตั้งค่า Email Provider

**ขั้นตอน:**
1. ไปที่ **Authentication** → **Settings** → **Email**
2. ตรวจสอบว่า **"Enable email confirmations"** ปิดอยู่
3. ตรวจสอบ **SMTP Settings** (ถ้ามี)

### 3. ตั้งค่า RLS (Row Level Security)

**ขั้นตอน:**
1. ไปที่ **Database** → **Tables**
2. หาตาราง `users` (ถ้ามี)
3. เปิดใช้งาน RLS
4. สร้าง policy สำหรับการ insert/select

### 4. ทดสอบ API หลังจากแก้ไข

```bash
# ทดสอบ register
curl -X POST http://localhost:4001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@gmail.com","password":"password123","username":"testuser","name":"Test User"}'

# ทดสอบ login
curl -X POST http://localhost:4001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@gmail.com","password":"password123"}'
```

## สาเหตุที่เป็นไปได้

1. **Email confirmation เปิดอยู่** - ต้องปิดใน Supabase Dashboard
2. **Email validation rules** - Supabase มีกฎการตรวจสอบ email ที่เข้มงวด
3. **RLS policies** - ต้องตั้งค่า Row Level Security ให้ถูกต้อง
4. **SMTP configuration** - การตั้งค่าการส่งอีเมลไม่ถูกต้อง

## หมายเหตุ
หลังจากปิด email confirmation แล้ว API จะทำงานได้ปกติ!
