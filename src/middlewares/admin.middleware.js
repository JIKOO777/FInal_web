// src/middlewares/admin.middleware.js
// Используется вместе с authMiddleware

export const adminOnly = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  if (req.user.role !== "ADMIN") return res.status(403).json({ message: "Forbidden" });
  next();
};
