import express from "express";
import { createClient } from "@supabase/supabase-js";
import protectAdmin from "../middleware/protectAdmin.js";

// Create Supabase client with fallback
const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY && 
  process.env.SUPABASE_URL !== 'https://your-project.supabase.co' 
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)
  : null;

const categoryRouter = express.Router();

// Get all categories
categoryRouter.get("/", async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: "Supabase not configured" });
    }

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: "Failed to fetch categories" });
    }

    return res.status(200).json(data || []);
  } catch (error) {
    console.error("Categories error:", error);
    return res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// Get category by ID
categoryRouter.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    if (!supabase) {
      return res.status(500).json({ error: "Supabase not configured" });
    }

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: "Failed to fetch category" });
    }

    if (!data) {
      return res.status(404).json({ error: "Category not found" });
    }

    return res.json(data);
  } catch (error) {
    console.error("Category error:", error);
    return res.status(500).json({ error: "Failed to fetch category" });
  }
});

// Create a new category
categoryRouter.post("/", protectAdmin, async (req, res) => {
  const { name } = req.body;
  try {
    if (!supabase) {
      return res.status(500).json({ error: "Supabase not configured" });
    }

    const { data, error } = await supabase
      .from('categories')
      .insert([{ name }])
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: "Failed to create category" });
    }

    return res.status(201).json({ message: "Created category successfully", data });
  } catch (error) {
    console.error("Category creation error:", error);
    return res.status(500).json({ error: "Failed to create category" });
  }
});

// Update an existing category
categoryRouter.put("/:id", protectAdmin, async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    if (!supabase) {
      return res.status(500).json({ error: "Supabase not configured" });
    }

    const { data, error } = await supabase
      .from('categories')
      .update({ name })
      .eq('id', id)
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: "Failed to update category" });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    return res.status(200).json({ message: "Updated category successfully", data });
  } catch (error) {
    console.error("Category update error:", error);
    return res.status(500).json({ error: "Failed to update category" });
  }
});

// Delete a category
categoryRouter.delete("/:id", protectAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    if (!supabase) {
      return res.status(500).json({ error: "Supabase not configured" });
    }

    const { data, error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: "Failed to delete category" });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    return res.json({ message: "Deleted category successfully" });
  } catch (error) {
    console.error("Category deletion error:", error);
    return res.status(500).json({ error: "Failed to delete category" });
  }
});

export default categoryRouter;