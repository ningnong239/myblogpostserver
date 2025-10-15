import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4001;

// ✅ API: GET /profiles
app.get("/profiles", (req, res) => {
  res.status(200).json({
    data: {
      name: "john",
      age: 20,
    },
  });
});

// ✅ เริ่มเซิร์ฟเวอร์
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
