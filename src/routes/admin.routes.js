import express from "express";
import { getUsers, setUserRole } from "../controllers/admin.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminOnly } from "../middlewares/admin.middleware.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";

const router = express.Router();

router.get("/users", authMiddleware, adminOnly, getUsers);
router.put("/users/:id/role", authMiddleware, adminOnly, setUserRole);

// 405 Method Not Allowed for known endpoints
router.all("/users", (req, res) => res.status(HTTP_STATUS.METHOD_NOT_ALLOWED).json({ message: "Method Not Allowed" }));
router.all("/users/:id/role", (req, res) => res.status(HTTP_STATUS.METHOD_NOT_ALLOWED).json({ message: "Method Not Allowed" }));

export default router;