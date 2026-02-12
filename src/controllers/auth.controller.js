// src/controllers/auth.controller.js
import * as authService from "../services/auth.service.js";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const result = await authService.registerUser({ name, email, password });
    res.status(201).json({
      user: {
        id: result.user._id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role
      },
      token: result.token
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser({ email, password });
    res.json({
      user: {
        id: result.user._id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role
      },
      token: result.token
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// JWT-logout — на сервере ничего не храним, клиент просто удаляет токен
export const logout = async (req, res) => {
  res.json({ message: "Logged out" });
};
