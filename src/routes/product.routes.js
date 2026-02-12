import express from "express";
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct
} from "../controllers/product.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminOnly } from "../middlewares/admin.middleware.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";

const router = express.Router();

// public read
router.get("/", getProducts);
router.get("/:id", getProductById);

// admin write
router.post("/", authMiddleware, adminOnly, createProduct);
router.put("/:id", authMiddleware, adminOnly, updateProduct);
router.delete("/:id", authMiddleware, adminOnly, deleteProduct);

// 405 Method Not Allowed for known endpoints
router.all("/", (req, res) => res.status(HTTP_STATUS.METHOD_NOT_ALLOWED).json({ message: "Method Not Allowed" }));
router.all("/:id", (req, res) => res.status(HTTP_STATUS.METHOD_NOT_ALLOWED).json({ message: "Method Not Allowed" }));

export default router;