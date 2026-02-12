// src/middlewares/error.middleware.js

import { HTTP_STATUS } from "../constants/httpStatus.js";

export const notFound = (req, res, next) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Route not found" });
};

export const errorHandler = (err, req, res, next) => {
  let status = err.statusCode || err.status || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = err.message || "Server error";

  // Mongoose: неверный ObjectId
  if (err.name === "CastError") {
    status = HTTP_STATUS.BAD_REQUEST;
    message = "Invalid id";
  }

  // Mongoose: ошибки валидации
  if (err.name === "ValidationError") {
    status = HTTP_STATUS.BAD_REQUEST;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  // Mongoose: нарушение unique
  if (err.code === 11000) {
    status = HTTP_STATUS.BAD_REQUEST;
    message = "Duplicate key";
  }

  // Не раскрываем stack на проде
  const payload = { message };
  if (process.env.NODE_ENV !== "production") {
    payload.stack = err.stack;
  }

  res.status(status).json(payload);
};
