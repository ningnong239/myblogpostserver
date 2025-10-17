// ========================================
// 🔐 AUTHENTICATION ROUTER - apps/auth.js
// ========================================

// 📦 Import Dependencies
import { Router } from "express";           // Express router
import { createClient } from "@supabase/supabase-js"; // Supabase client
import connectionPool from "../db.js";      // PostgreSQL connection pool

// 🔧 Supabase Configuration with Fallback
// ถ้าไม่มี Supabase config จะใช้ mock authentication
const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY && 
  process.env.SUPABASE_URL !== 'https://your-project.supabase.co' 
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)
  : null;

// 🛠️ Initialize Router
const authRouter = Router();

// ========================================
// 📝 POST /auth/register - User Registration
// ========================================
authRouter.post("/register", async (req, res) => {
  // 📥 Extract data from request body
  const { email, password, username, name } = req.body;

  // ✅ Input Validation
  if (!email || !password || !username || !name) {
    return res.status(400).json({ 
      error: "All fields are required",
      required: ["email", "password", "username", "name"]
    });
  }

  try {
    // 🔍 Check Supabase Configuration
    if (!supabase) {
      console.log("🔧 Supabase not configured, using mock registration");
      
      // 🎭 Mock User Creation (for testing without Supabase)
      const mockUser = {
        id: Date.now().toString(),
        email,
        username,
        name,
        role: "user",
        profile_pic: null
      };

      return res.status(201).json({
        message: "✅ User created successfully (mock mode)",
        user: mockUser
      });
    }

    // 🔐 Create User in Supabase Authentication
    const { data, error: supabaseError } = await supabase.auth.signUp({
      email,
      password,
    });

    // ❌ Handle Supabase Errors
    if (supabaseError) {
      console.error("❌ Supabase error:", supabaseError);
      return res.status(400).json({ 
        error: supabaseError.message || "Failed to create user. Please try again." 
      });
    }
    
    // 🆔 Get Supabase User ID
    const supabaseUserId = data.user.id;

    // 💾 Save User Details to Supabase Database (using RPC)
    const { data: userData, error: dbError } = await supabase.rpc('insert_user', {
      user_id: supabaseUserId,
      user_username: username,
      user_name: name,
      user_email: email,
      user_role: 'user'
    });

    if (dbError) {
      console.error("❌ Database error:", dbError);
      // Fallback: Return basic user info if database insert fails
      return res.status(201).json({
        message: "✅ User created successfully (Supabase Auth only)",
        user: {
          id: supabaseUserId,
          username,
          name,
          email,
          role: 'user'
        }
      });
    }
    
    // ✅ Success Response
    res.status(201).json({
      message: "✅ User created successfully",
      user: userData,
    });
    
  } catch (error) {
    // 🚨 Error Handling
    console.error("❌ Registration error:", error);
    res.status(500).json({ 
      error: "An error occurred during registration",
      details: error.message 
    });
  }
});

// ========================================
// 🔑 POST /auth/login - User Login
// ========================================
authRouter.post("/login", async (req, res) => {
  // 📥 Extract credentials from request body
  const { email, password } = req.body;

  // ✅ Input Validation
  if (!email || !password) {
    return res.status(400).json({ 
      error: "Email and password are required",
      required: ["email", "password"]
    });
  }

  try {
    // 🔍 Check Supabase Configuration
    if (!supabase) {
      console.log("🔧 Supabase not configured, using mock login");
      
      // 🎭 Mock Login for Testing (Admin User)
      if (email === "admin@example.com" && password === "password123") {
        return res.status(200).json({
          message: "✅ Signed in successfully (mock mode)",
          access_token: "admin-token",
          user: {
            id: "1",
            email: "admin@example.com",
            username: "admin",
            name: "Admin User",
            role: "admin"
          }
        });
      }
      
      // 🎭 Mock Login for Testing (Regular User)
      if (email === "user@example.com" && password === "password123") {
        return res.status(200).json({
          message: "✅ Signed in successfully (mock mode)",
          access_token: "user-token",
          user: {
            id: "2",
            email: "user@example.com",
            username: "user",
            name: "Regular User",
            role: "user"
          }
        });
      }
      
      // ❌ Invalid Credentials
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // 🔍 Get User Details from Supabase Database
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (dbError) {
      console.log("⚠️ User not found in database, using basic info");
      // Fallback: Return basic user info if not found in database
      return res.status(200).json({
        message: "Signed in successfully",
        access_token: data.session.access_token,
        user: {
          id: data.user.id,
          email: data.user.email,
          username: email.split('@')[0],
          name: data.user.user_metadata?.name || email.split('@')[0],
          role: "user"
        }
      });
    }

    return res.status(200).json({
      message: "Signed in successfully",
      access_token: data.session.access_token,
      user: userData
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "An error occurred during login" });
  }
});

authRouter.get("/get-user", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Unauthorized: Token missing" });
  }

  try {
    // Check if Supabase is configured
    if (!supabase) {
      console.log("Supabase not configured, using mock get-user");
      
      // Mock token validation
      const mockTokens = {
        "admin-token": {
          id: "1",
          email: "admin@example.com",
          username: "admin",
          name: "Admin User",
          role: "admin",
          profilePic: null
        },
        "user-token": {
          id: "2",
          email: "user@example.com",
          username: "user",
          name: "Regular User",
          role: "user",
          profilePic: null
        }
      };

      const user = mockTokens[token];
      if (!user) {
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
      }

      return res.status(200).json(user);
    }

    // Fetch user information from Supabase
    const { data, error } = await supabase.auth.getUser(token);
    if (error) {
      return res.status(401).json({ error: "Unauthorized or token expired" });
    }

    const supabaseUserId = data.user.id;
    const query = `SELECT * FROM users WHERE id = $1`;
    const values = [supabaseUserId];
    const { rows } = await connectionPool.query(query, values);

    res.status(200).json({
      id: data.user.id,
      email: data.user.email,
      username: rows[0].username,
      name: rows[0].name,
      role: rows[0].role,
      profilePic: rows[0].profile_pic,
    });
  } catch (err) {
    console.error("Error fetching user info:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

authRouter.post("/logout", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Unauthorized: Token missing" });
  }

  try {
    // Check if Supabase is configured
    if (!supabase) {
      console.log("Supabase not configured, using mock logout");
      return res.status(200).json({
        message: "Logged out successfully (mock mode)"
      });
    }

    // Sign out the user using Supabase
    const { error } = await supabase.auth.signOut();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json({
      message: "Logged out successfully"
    });
  } catch (error) {
    console.error("Error during logout:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

authRouter.put("/reset-password", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const { oldPassword, newPassword } = req.body;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized: Token missing" });
  }

  if (!newPassword) {
    return res.status(400).json({ error: "New password is required" });
  }

  try {
    // Check if Supabase is configured
    if (!supabase) {
      console.log("Supabase not configured, using mock reset-password");
      return res.status(200).json({
        message: "Password updated successfully (mock mode)",
        user: { id: "1", email: "user@example.com" }
      });
    }

    // Set the session with the provided token
    const { data: userData, error: userError } = await supabase.auth.getUser(
      token
    );

    if (userError) {
      return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }
    
    // Step 1: Verify the old password by attempting to sign in
    const { data: loginData, error: loginError } =
      await supabase.auth.signInWithPassword({
        email: userData.user.email,
        password: oldPassword,
      });

    if (loginError) {
      return res.status(400).json({ error: "Invalid old password" });
    }

    // Proceed with updating the user's password
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json({
      message: "Password updated successfully",
      user: data.user,
    });
  } catch (err) {
    console.error("Error updating password:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default authRouter;