import express from "express";
import {
  createOrderFromCart,
  getAllOrders,
  getMyOrders,
  getOrderById,
  updateOrderStatus
} from "../controllers/order.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminOnly } from "../middlewares/admin.middleware.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";

const router = express.Router();

// USER
router.post("/", authMiddleware, createOrderFromCart);
router.get("/my", authMiddleware, getMyOrders);
router.get("/:id", authMiddleware, getOrderById);

// ADMIN
router.get("/", authMiddleware, adminOnly, getAllOrders);
router.put("/:id/status", authMiddleware, adminOnly, updateOrderStatus);

// 405 Method Not Allowed for known endpoints
router.all("/", (req, res) => res.status(HTTP_STATUS.METHOD_NOT_ALLOWED).json({ message: "Method Not Allowed" }));
router.all("/my", (req, res) => res.status(HTTP_STATUS.METHOD_NOT_ALLOWED).json({ message: "Method Not Allowed" }));
router.all("/:id", (req, res) => res.status(HTTP_STATUS.METHOD_NOT_ALLOWED).json({ message: "Method Not Allowed" }));
router.all("/:id/status", (req, res) => res.status(HTTP_STATUS.METHOD_NOT_ALLOWED).json({ message: "Method Not Allowed" }));

export default router;