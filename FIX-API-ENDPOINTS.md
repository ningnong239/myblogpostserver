# 🔧 สรุปการแก้ไข API Endpoints

## ปัญหาที่พบ:

### 1. `/auth/login` endpoint
**ปัจจุบัน:** ส่งคืนเฉพาะ `access_token` และ `message`
```json
{
  "message": "Signed in successfully",
  "access_token": "eyJhbGciOiJIUzI1Ni..."
}
```

**ต้องการ:** ส่งคืน `access_token` และ `user` object
```json
{
  "access_token": "eyJhbGciOiJIUzI1Ni...",
  "user": {
    "id": "uuid-of-user",
    "email": "test@example.com",
    "name": "Test User",
    "avatar": "https://example.com/avatar.jpg"
  }
}
```

### 2. `/auth/get-user` endpoint
**ปัจจุบัน:** ส่งคืน `username` และ `profilePic`
```json
{
  "id": "uuid-of-user",
  "email": "test@example.com",
  "username": "testuser",
  "name": "Test User",
  "role": "user",
  "profilePic": "https://example.com/avatar.jpg"
}
```

**ต้องการ:** ส่งคืน `avatar` แทน `profilePic` และไม่ต้องการ `username`, `role`
```json
{
  "id": "uuid-of-user",
  "email": "test@example.com",
  "name": "Test User",
  "avatar": "https://example.com/avatar.jpg"
}
```

### 3. ปัญหาเพิ่มเติม:
- `/auth/get-user` ใช้ `connectionPool` (PostgreSQL) แทนที่จะใช้ Supabase client
- ต้องแก้ไขให้ใช้ Supabase client เพื่อความสอดคล้อง

## การแก้ไข:
1. แก้ไข `/auth/login` ให้ fetch user data จาก Supabase และส่งคืนใน response
2. แก้ไข `/auth/get-user` ให้ใช้ Supabase client และส่งคืนเฉพาะ fields ที่ต้องการ
3. เปลี่ยน `profile_pic` เป็น `avatar` ใน response
