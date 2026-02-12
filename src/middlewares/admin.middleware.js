// src/middlewares/admin.middleware.js
// Используется вместе с authMiddleware

import { HTTP_STATUS } from "../constants/httpStatus.js";

export const adminOnly = (req, res, next) => {
  if (!req.user) return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: "Unauthorized" });
  if (req.user.role !== "ADMIN") return res.status(HTTP_STATUS.FORBIDDEN).json({ message: "Forbidden" });
  next();
};
