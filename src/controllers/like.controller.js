import Product from "../models/Product.js";
import User from "../models/User.js";

// GET /api/likes/ids
export const getLikedIds = async (req, res) => {
  const user = await User.findById(req.user._id).select("likes");
  res.json({ ids: (user?.likes || []).map((id) => id.toString()) });
};

// GET /api/likes
export const getLikedProducts = async (req, res) => {
  const user = await User.findById(req.user._id).select("likes");
  const ids = user?.likes || [];
  const items = await Product.find({ _id: { $in: ids } }).sort({ createdAt: -1 });
  res.json({ items });
};

// POST /api/likes/:productId/toggle
export const toggleLike = async (req, res) => {
  const { productId } = req.params;

  const product = await Product.findById(productId).select("_id");
  if (!product) return res.status(404).json({ message: "Product not found" });

  const user = await User.findById(req.user._id).select("likes");
  const likes = user.likes || [];
  const exists = likes.some((id) => id.toString() === productId);

  if (exists) {
    user.likes = likes.filter((id) => id.toString() !== productId);
  } else {
    user.likes = [...likes, product._id];
  }

  await user.save();
  res.json({ liked: !exists, ids: user.likes.map((id) => id.toString()) });
};
