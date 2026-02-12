import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { getLikedIds, getLikedProducts, toggleLike } from "../controllers/like.controller.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";

const router = express.Router();

router.get("/ids", authMiddleware, getLikedIds);
router.get("/", authMiddleware, getLikedProducts);
router.post("/:productId/toggle", authMiddleware, toggleLike);

// 405 Method Not Allowed for known endpoints
router.all("/ids", (req, res) => res.status(HTTP_STATUS.METHOD_NOT_ALLOWED).json({ message: "Method Not Allowed" }));
router.all("/", (req, res) => res.status(HTTP_STATUS.METHOD_NOT_ALLOWED).json({ message: "Method Not Allowed" }));
router.all("/:productId/toggle", (req, res) => res.status(HTTP_STATUS.METHOD_NOT_ALLOWED).json({ message: "Method Not Allowed" }));

export default router;
