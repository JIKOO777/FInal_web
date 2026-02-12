import User from "../models/User.js";
import * as authService from "../services/auth.service.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const result = await authService.registerUser({ name, email, password });
    res.status(HTTP_STATUS.CREATED).json({ user: result.user, token: result.token });
  } catch (err) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser({ email, password });
    res.status(HTTP_STATUS.OK).json({ user: result.user, token: result.token });
  } catch (err) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({ message: err.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-passwordHash");
    if (!user) return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "User not found" });
    res.status(HTTP_STATUS.OK).json({ user });
  } catch (err) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "User not found" });

    if (req.body.name) user.name = req.body.name.trim();
    const updatedUser = await user.save();

    res.status(HTTP_STATUS.OK).json({ user: updatedUser, message: "Profile updated" });
  } catch (err) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: err.message });
  }
};

export const logout = async (req, res) => {
  res.status(HTTP_STATUS.OK).json({ message: "Logged out" });
};
