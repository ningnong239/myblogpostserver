import * as pg from "pg";
import "dotenv/config";
const { Pool } = pg.default;

const connectionPool = new Pool({
  host: process.env.DB_HOST || "aws-1-ap-southeast-1.pooler.supabase.com",
  port: process.env.DB_PORT || 6543,
  user: process.env.DB_USER || "postgres.rxlmkbwpfruzzvnlgqtr",
  password: process.env.DB_PASSWORD || "181818",
  database: process.env.DB_NAME || "postgres",
  ssl: { rejectUnauthorized: false }
});

export default connectionPool;
