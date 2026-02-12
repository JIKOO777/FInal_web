import express from "express";
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
  updateCategory
} from "../controllers/category.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminOnly } from "../middlewares/admin.middleware.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";

const router = express.Router();

// public read
router.get("/", getCategories);
router.get("/:id", getCategoryById);

// admin write
router.post("/", authMiddleware, adminOnly, createCategory);
router.put("/:id", authMiddleware, adminOnly, updateCategory);
router.delete("/:id", authMiddleware, adminOnly, deleteCategory);

// 405 Method Not Allowed for known endpoints
router.all("/", (req, res) => res.status(HTTP_STATUS.METHOD_NOT_ALLOWED).json({ message: "Method Not Allowed" }));
router.all("/:id", (req, res) => res.status(HTTP_STATUS.METHOD_NOT_ALLOWED).json({ message: "Method Not Allowed" }));

export default router;