import { Router } from "express";
import protectAdmin from "../middleware/protectAdmin.js";
import multer from "multer";
import { createClient } from "@supabase/supabase-js";

// Create Supabase client with fallback
const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY && 
  process.env.SUPABASE_URL !== 'https://your-project.supabase.co' 
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)
  : {
      storage: {
        from: () => ({
          upload: () => Promise.resolve({ data: { path: 'mock-path' }, error: null }),
          getPublicUrl: () => ({ data: { publicUrl: 'https://example.com/mock-image.jpg' } })
        })
      }
    };

const postRouter = Router();

const multerUpload = multer({ storage: multer.memoryStorage() });

const imageFileUpload = multerUpload.fields([
  { name: "imageFile", maxCount: 1 },
]);

postRouter.post("/", [imageFileUpload, protectAdmin], async (req, res) => {


    // 1) Access ข้อมูลใน Body จาก Request ด้วย req.body
    const newPost = req.body;
    const file = req.files.imageFile[0];

    // Define the Supabase Storage bucket name (replace with your bucket name)
  const bucketName = "my-personal-blog";
  const filePath = `posts/${Date.now()}`; // Unique file path

  // 2) เขียน Query เพื่อ Insert ข้อมูลโพสต์ ด้วย Connection Pool
  try {
    // Upload the image to Supabase storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false, // Prevent overwriting the file
      });

      if (error) {
        throw error; // If an error occurs while uploading
      }
      // Get the public URL of the uploaded file
      const {
        data: { publicUrl },
      } = supabase.storage.from(bucketName).getPublicUrl(data.path);

      // Insert post data into Supabase
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .insert([{
          title: newPost.title,
          image: publicUrl,
          category_id: parseInt(newPost.category_id),
          description: newPost.description,
          content: newPost.content,
          status_id: parseInt(newPost.status_id)
        }])
        .select();

      if (postError) {
        console.error("Supabase post creation error:", postError);
        throw postError;
      }
    } catch (err) {
      return res.status(500).json({
        message: `Server could not create post because database connection`,
      });
    }

  // 3) Return ตัว Response กลับไปหา Client ว่าสร้างสำเร็จ
  return res.status(201).json({ message: "Created post successfully" });
});

// get all published posts
postRouter.get("/", async (req, res) => {
  // ลอจิกในอ่านข้อมูลโพสต์ทั้งหมดในระบบ
  try {
    // 1) Access ข้อมูลใน Body จาก Request ด้วย req.body
    const category = req.query.category || "";
    const keyword = req.query.keyword || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 6;

    // 2) ทำให้แน่ใจว่า query parameter page และ limit จะมีค่าอย่างต่ำเป็น 1
    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, Math.min(100, limit));
    const offset = (safePage - 1) * safeLimit;
    // offset คือค่าที่ใช้ในการข้ามจำนวนข้อมูลบางส่วนตอน query ข้อมูลจาก database
    // ถ้า page = 2 และ limit = 6 จะได้ offset = (2 - 1) * 6 = 6 หมายความว่าต้องข้ามแถวไป 6 แถวแรก และดึงแถวที่ 7-12 แทน

    // 3) เขียน Query เพื่อ Insert ข้อมูลโพสต์ ด้วย Connection Pool
    let query = `
        SELECT 
        posts.*, 
        categories.name AS category, 
        statuses.status
    FROM posts
    INNER JOIN categories ON posts.category_id = categories.id
    INNER JOIN statuses ON posts.status_id = statuses.id
    WHERE statuses.id = 2 
  `;
    let values = [];

    // 4) เขียน query จากเงื่อนไขของการใส่ query parameter category และ keyword
    if (category && keyword) {
      query += `
           AND categories.name ILIKE $1 
          AND (posts.title ILIKE $2 OR posts.description ILIKE $2 OR posts.content ILIKE $2)
           `;
      values = [`%${category}%`, `%${keyword}%`];
    } else if (category) {
      query += " AND categories.name ILIKE $1";
      values = [`%${category}%`];
    } else if (keyword) {
      query += `
           AND (posts.title ILIKE $1 
          OR posts.description ILIKE $1 
          OR posts.content ILIKE $1)
        `;
      values = [`%${keyword}%`];
    }

    // 5) เพิ่มการ odering ตามวันที่, limit และ offset
    query += ` ORDER BY posts.date DESC LIMIT $${values.length + 1} OFFSET $${
      values.length + 2
    }`;

    values.push(safeLimit, offset);

    // 6) Execute the main query using Supabase
    if (!supabase) {
      return res.status(500).json({ error: "Supabase not configured" });
    }

    // Build Supabase query
    let supabaseQuery = supabase
      .from('posts')
      .select(`
        *,
        categories!inner(name)
      `)
      .eq('status_id', 2) // Only published posts
      .order('date', { ascending: false })
      .range(offset, offset + safeLimit - 1);

    // Add filters
    if (category) {
      supabaseQuery = supabaseQuery.ilike('categories.name', `%${category}%`);
    }
    if (keyword) {
      supabaseQuery = supabaseQuery.or(`title.ilike.%${keyword}%,description.ilike.%${keyword}%,content.ilike.%${keyword}%`);
    }

    const { data: posts, error } = await supabaseQuery;

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: "Failed to fetch posts" });
    }

    const result = { rows: posts || [] };

    // 7) Get total count for pagination using Supabase
    let countQuery = supabase
      .from('posts')
      .select('id', { count: 'exact' })
      .eq('status_id', 2);

    if (category) {
      countQuery = countQuery.ilike('categories.name', `%${category}%`);
    }
    if (keyword) {
      countQuery = countQuery.or(`title.ilike.%${keyword}%,description.ilike.%${keyword}%,content.ilike.%${keyword}%`);
    }

    const { count: totalPosts, error: countError } = await countQuery;

    if (countError) {
      console.error("Supabase count error:", countError);
      return res.status(500).json({ error: "Failed to count posts" });
    }

    // 8) สร้าง response พร้อมข้อมูลการแบ่งหน้า (pagination)
    const results = {
      totalPosts: totalPosts || 0,
      totalPages: Math.ceil((totalPosts || 0) / safeLimit),
      currentPage: safePage,
      limit: safeLimit,
      posts: result.rows,
    };
    // เช็คว่ามีหน้าถัดไปหรือไม่
    if (offset + safeLimit < (totalPosts || 0)) {
      results.nextPage = safePage + 1;
    }
    // เช็คว่ามีหน้าก่อนหน้าหรือไม่
    if (offset > 0) {
      results.previousPage = safePage - 1;
    }
    // 9) Return ตัว Response กลับไปหา Client ว่าสร้างสำเร็จ
    return res.status(200).json(results);
  } catch {
    return res.status(500).json({
      message: "Server could not read post because database issue",
    });
  }
});

// get all posts including draf
postRouter.get("/admin", protectAdmin, async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: "Supabase not configured" });
    }

    // Query all posts with their category for admin view
    const { data: posts, error } = await supabase
      .from('posts')
      .select(`
        *,
        categories!inner(name)
      `)
      .order('date', { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: "Failed to fetch posts" });
    }

    // Return all posts as the response
    return res.status(200).json({
      posts: posts || [],
    });
  } catch (error) {
    console.error("Admin posts error:", error);
    return res.status(500).json({
      message: "Server could not read posts because of a database issue",
    });
  }
});
    
postRouter.get("/:postId", async (req, res) => {
  const postIdFromClient = req.params.postId;

  try {
    if (!supabase) {
      return res.status(500).json({ error: "Supabase not configured" });
    }

    // Query post with category using Supabase
    const { data: post, error } = await supabase
      .from('posts')
      .select(`
        *,
        categories!inner(name)
      `)
      .eq('id', postIdFromClient)
      .eq('status_id', 2) // Only published posts
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: "Failed to fetch post" });
    }

    if (!post) {
      return res.status(404).json({
        message: `Server could not find a requested post (post id: ${postIdFromClient})`,
      });
    }

    return res.status(200).json(post);
  } catch (err) {
    console.error("Post fetch error:", err);
    return res.status(500).json({
      message: `Server could not read post because database issue`,
    });
  }
});

postRouter.get("/admin/:postId", protectAdmin, async (req, res) => {
  const postIdFromClient = req.params.postId;

  try {
    if (!supabase) {
      return res.status(500).json({ error: "Supabase not configured" });
    }

    // Query post with category using Supabase
    const { data: post, error } = await supabase
      .from('posts')
      .select(`
        *,
        categories!inner(name)
      `)
      .eq('id', postIdFromClient)
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: "Failed to fetch post" });
    }

    if (!post) {
      return res.status(404).json({
        message: `Server could not find a requested post (post id: ${postIdFromClient})`,
      });
    }

    return res.status(200).json(post);
  } catch (err) {
    console.error("Admin post fetch error:", err);
    return res.status(500).json({
      message: `Server could not read post because database issue`,
    });
  }
});

postRouter.put(
"/:postId",
[imageFileUpload, protectAdmin],
async (req, res) => {
  const postIdFromClient = req.params.postId;
  const updatedPost = { ...req.body, date: new Date() };

    // Define the Supabase Storage bucket name
    const bucketName = "my-personal-blog";

    try {
      let publicUrl = updatedPost.image; // Default to the existing image URL
      const file = req.files?.imageFile?.[0]; // Check if a new file is attached

      if (file) {
        // If a new image file is attached, upload it to Supabase
        const filePath = `posts/${Date.now()}`; // Unique file path

        const { data, error } = await supabase.storage
          .from(bucketName)
          .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            upsert: false, // Prevent overwriting existing files
          });

          if (error) {
            throw error; // If Supabase upload fails
          }
  
          // Get the public URL of the uploaded file
          const response = supabase.storage
            .from(bucketName)
            .getPublicUrl(data.path);
  
          if (response.error) {
            throw response.error;
          }
  
          publicUrl = response.data.publicUrl;
        }
  
        // Update the database using Supabase
        const { data, error: updateError } = await supabase
          .from('posts')
          .update({
            title: updatedPost.title,
            image: publicUrl,
            category_id: parseInt(updatedPost.category_id),
            description: updatedPost.description,
            content: updatedPost.content,
            status_id: parseInt(updatedPost.status_id),
            date: updatedPost.date
          })
          .eq('id', postIdFromClient)
          .select();

        if (updateError) {
          console.error("Supabase update error:", updateError);
          throw updateError;
        }

        if (!data || data.length === 0) {
          return res.status(404).json({
            message: `Server could not find a requested post to update (post id: ${postIdFromClient})`,
          });
        }


      return res.status(200).json({
        message: "Updated post successfully",
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: `Server could not update post due to an error`,
      });
    }
  }
);

postRouter.delete("/:postId", protectAdmin, async (req, res) => {
  const postIdFromClient = req.params.postId;

  try {
    if (!supabase) {
      return res.status(500).json({ error: "Supabase not configured" });
    }

    // Delete post using Supabase
    const { data, error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postIdFromClient)
      .select();

    if (error) {
      console.error("Supabase delete error:", error);
      return res.status(500).json({ error: "Failed to delete post" });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        message: `Server could not find a requested post to delete (post id: ${postIdFromClient})`,
      });
    }

    return res.status(200).json({
      message: "Deleted post successfully",
    });
  } catch (err) {
    console.error("Post deletion error:", err);
    return res.status(500).json({
      message: `Server could not delete post because database connection`,
    });
  }
});

export default postRouter;
