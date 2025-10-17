# 🔗 เชื่อมต่อ Frontend กับ API

## ข้อมูล API
- **API URL:** `http://localhost:4001`
- **Status:** ✅ **พร้อมใช้งาน**
- **Supabase:** ✅ **เชื่อมต่อแล้ว**

## การเชื่อมต่อ Frontend

### 1. ตรวจสอบ Frontend Project
```bash
# ไปที่โปรเจค frontend
cd ../my-blog-post

# ตรวจสอบว่า frontend ทำงานอยู่
npm run dev
```

### 2. แก้ไข API URL ใน Frontend
ในไฟล์ frontend (อาจเป็น `src/api.js` หรือ `src/config.js`):

```javascript
// เปลี่ยน API URL เป็น
const API_BASE_URL = 'http://localhost:4001';

// หรือ
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4001';
```

### 3. ตัวอย่างการใช้งาน API

#### Register User
```javascript
const registerUser = async (userData) => {
  try {
    const response = await fetch('http://localhost:4001/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: userData.email,
        password: userData.password,
        username: userData.username,
        name: userData.name
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('User registered successfully:', data);
      return data;
    } else {
      throw new Error(data.error || 'Registration failed');
    }
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};
```

#### Login User
```javascript
const loginUser = async (email, password) => {
  try {
    const response = await fetch('http://localhost:4001/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    
    if (response.ok) {
      // เก็บ token ใน localStorage
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      console.log('Login successful:', data);
      return data;
    } else {
      throw new Error(data.error || 'Login failed');
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};
```

#### Get User Info
```javascript
const getUserInfo = async () => {
  try {
    const token = localStorage.getItem('access_token');
    
    const response = await fetch('http://localhost:4001/auth/get-user', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();
    
    if (response.ok) {
      return data;
    } else {
      throw new Error(data.error || 'Failed to get user info');
    }
  } catch (error) {
    console.error('Get user error:', error);
    throw error;
  }
};
```

### 4. Test Credentials
```javascript
// ใช้ข้อมูลนี้สำหรับทดสอบ
const testUser = {
  email: 'testuser17@gmail.com',
  password: 'password123',
  username: 'testuser17',
  name: 'Test User 17'
};
```

### 5. ตรวจสอบการเชื่อมต่อ
```javascript
// ทดสอบ API connection
const testAPI = async () => {
  try {
    const response = await fetch('http://localhost:4001/');
    const data = await response.json();
    console.log('API Status:', data);
    return data;
  } catch (error) {
    console.error('API Connection Error:', error);
    throw error;
  }
};
```

## ขั้นตอนการทดสอบ

1. **เริ่ม API Server:**
   ```bash
   cd myblogpostserver
   node server.js
   ```

2. **เริ่ม Frontend:**
   ```bash
   cd my-blog-post
   npm run dev
   ```

3. **ทดสอบใน Frontend:**
   - ใช้ email: `testuser17@gmail.com`
   - ใช้ password: `password123`
   - ควร login ได้และไม่เด้งออก

## หมายเหตุ
- API ทำงานที่ port 4001
- Frontend ทำงานที่ port 5179 (หรือ port อื่น)
- ต้องเปิดทั้งสองเซิร์ฟเวอร์พร้อมกัน
