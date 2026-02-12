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

const router = express.Router();

// USER
router.post("/", authMiddleware, createOrderFromCart);
router.get("/my", authMiddleware, getMyOrders);
router.get("/:id", authMiddleware, getOrderById);

// ADMIN
router.get("/", authMiddleware, adminOnly, getAllOrders);
router.put("/:id/status", authMiddleware, adminOnly, updateOrderStatus);

export default router;