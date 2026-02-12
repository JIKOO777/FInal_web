// src/middlewares/error.middleware.js

export const notFound = (req, res, next) => {
  res.status(404).json({ message: "Route not found" });
};

export const errorHandler = (err, req, res, next) => {
  let status = err.statusCode || err.status || 500;
  let message = err.message || "Server error";

  // Mongoose: неверный ObjectId
  if (err.name === "CastError") {
    status = 400;
    message = "Invalid id";
  }

  // Mongoose: ошибки валидации
  if (err.name === "ValidationError") {
    status = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  // Mongoose: нарушение unique
  if (err.code === 11000) {
    status = 400;
    message = "Duplicate key";
  }

  // Не раскрываем stack на проде
  const payload = { message };
  if (process.env.NODE_ENV !== "production") {
    payload.stack = err.stack;
  }

  res.status(status).json(payload);
};
