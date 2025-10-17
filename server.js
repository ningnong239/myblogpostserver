import "dotenv/config";
import express from "express";
import cors from "cors";
import postRouter from "./apps/postRouter.js";
import categoryRouter from "./apps/categoryRouter.js";
import authRouter from "./apps/auth.js";
import profileRouter from "./apps/profileRouter.js";
import { createClient } from "@supabase/supabase-js";

// Create Supabase client with fallback
console.log("🔍 Environment check:");
console.log("SUPABASE_URL:", process.env.SUPABASE_URL);
console.log("SUPABASE_ANON_KEY:", process.env.SUPABASE_ANON_KEY ? "exists" : "missing");

const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY && 
  process.env.SUPABASE_URL !== 'https://your-project.supabase.co' 
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)
  : null;

console.log("Supabase client:", supabase ? "✅ Connected" : "❌ Mock mode");
const app = express();
const port = process.env.PORT || 4001;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "🚀 Blog API Server is running!",
    version: "1.0.0",
    endpoints: {
      auth: {
        register: "POST /auth/register",
        login: "POST /auth/login", 
        getUser: "GET /auth/get-user",
        logout: "POST /auth/logout",
        resetPassword: "POST /auth/reset-password"
      },
      posts: {
        getAll: "GET /posts",
        getById: "GET /posts/:id",
        create: "POST /posts (Admin only)",
        update: "PUT /posts/:id (Admin only)",
        delete: "DELETE /posts/:id (Admin only)"
      },
      categories: {
        getAll: "GET /categories",
        getById: "GET /categories/:id",
        create: "POST /categories (Admin only)",
        update: "PUT /categories/:id (Admin only)",
        delete: "DELETE /categories/:id (Admin only)"
      },
      profile: {
        update: "PUT /profile (User only)",
        uploadAvatar: "POST /profile/avatar (User only)"
      }
    },
    status: supabase ? "🔗 Connected to Supabase" : "🎭 Using Mock Mode"
  });
});

app.use("/posts", postRouter);
app.use("/categories", categoryRouter);
app.use("/auth", authRouter);
app.use("/profile", profileRouter);

// Start server
const server = app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});

// Export for Vercel
export default app;