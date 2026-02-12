import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { getLikedIds, getLikedProducts, toggleLike } from "../controllers/like.controller.js";

const router = express.Router();

router.get("/ids", authMiddleware, getLikedIds);
router.get("/", authMiddleware, getLikedProducts);
router.post("/:productId/toggle", authMiddleware, toggleLike);

export default router;
