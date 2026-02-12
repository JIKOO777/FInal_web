import Product from "../models/Product.js";
import User from "../models/User.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";

// GET /api/likes/ids
export const getLikedIds = async (req, res) => {
  const user = await User.findById(req.user._id).select("likes");
  res.status(HTTP_STATUS.OK).json({ ids: (user?.likes || []).map((id) => id.toString()) });
};

// GET /api/likes
export const getLikedProducts = async (req, res) => {
  const user = await User.findById(req.user._id).select("likes");
  const ids = user?.likes || [];
  const items = await Product.find({ _id: { $in: ids } }).sort({ createdAt: -1 });
  res.status(HTTP_STATUS.OK).json({ items });
};

// POST /api/likes/:productId/toggle
export const toggleLike = async (req, res) => {
  const { productId } = req.params;

  const product = await Product.findById(productId).select("_id");
  if (!product) return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Product not found" });

  const user = await User.findById(req.user._id).select("likes");
  const likes = user.likes || [];
  const exists = likes.some((id) => id.toString() === productId);

  if (exists) {
    user.likes = likes.filter((id) => id.toString() !== productId);
  } else {
    user.likes = [...likes, product._id];
  }

  await user.save();
  res.status(HTTP_STATUS.OK).json({ liked: !exists, ids: user.likes.map((id) => id.toString()) });
};
