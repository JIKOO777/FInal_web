import express from "express";
import {
  addToCart,
  clearCart,
  getMyCart,
  removeCartItem,
  updateCartItem
} from "../controllers/cart.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";

const router = express.Router();

router.get("/", authMiddleware, getMyCart);
router.post("/items", authMiddleware, addToCart);
router.put("/items/:itemId", authMiddleware, updateCartItem);
router.delete("/items/:itemId", authMiddleware, removeCartItem);
router.delete("/clear", authMiddleware, clearCart);

// 405 Method Not Allowed for known endpoints
router.all("/", (req, res) => res.status(HTTP_STATUS.METHOD_NOT_ALLOWED).json({ message: "Method Not Allowed" }));
router.all("/items", (req, res) => res.status(HTTP_STATUS.METHOD_NOT_ALLOWED).json({ message: "Method Not Allowed" }));
router.all("/items/:itemId", (req, res) => res.status(HTTP_STATUS.METHOD_NOT_ALLOWED).json({ message: "Method Not Allowed" }));
router.all("/clear", (req, res) => res.status(HTTP_STATUS.METHOD_NOT_ALLOWED).json({ message: "Method Not Allowed" }));

export default router;
