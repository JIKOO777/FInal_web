import express from "express";
import { getUsers, setUserRole } from "../controllers/admin.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminOnly } from "../middlewares/admin.middleware.js";

const router = express.Router();

router.get("/users", authMiddleware, adminOnly, getUsers);
router.put("/users/:id/role", authMiddleware, adminOnly, setUserRole);

export default router;