// src/routes/auth.routes.js
import express from "express";
import { register, login, logout } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

// регистрация
router.post("/register", register);

// вход
router.post("/login", login);

// выход (JWT) — клиент удаляет token
router.post("/logout", authMiddleware, logout);

// пример защищённого маршрута
router.get("/profile", authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

export default router;
