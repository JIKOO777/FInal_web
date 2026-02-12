import User from "../models/User.js";
import Product from "../models/Product.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";

export const getMyCart = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select("cart")
      .populate("cart.items.product");
    res.status(HTTP_STATUS.OK).json(user.cart || { items: [] });
  } catch (err) {
    next(err);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const { productId, size, color, quantity } = req.body;
    if (!productId) return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "productId is required" });

    const product = await Product.findById(productId);
    if (!product) return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Product not found" });

    const qty = Math.max(parseInt(quantity || "1", 10), 1);

    const user = await User.findById(req.user._id);
    if (!user.cart) user.cart = { items: [] };

    // считаем одинаковым товар+size+color
    const idx = user.cart.items.findIndex(
      (i) => String(i.product) === String(productId) && String(i.size || "") === String(size || "") && String(i.color || "") === String(color || "")
    );

    if (idx >= 0) {
      user.cart.items[idx].quantity += qty;
    } else {
      user.cart.items.push({ product: productId, size, color, quantity: qty });
    }

    await user.save();
    const fresh = await User.findById(req.user._id).select("cart").populate("cart.items.product");
    res.status(HTTP_STATUS.CREATED).json(fresh.cart);
  } catch (err) {
    next(err);
  }
};

export const updateCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const qty = Math.max(parseInt(quantity || "1", 10), 1);

    const user = await User.findById(req.user._id);
    if (!user.cart) user.cart = { items: [] };

    const item = user.cart.items.id(itemId);
    if (!item) return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Cart item not found" });

    item.quantity = qty;
    await user.save();
    const fresh = await User.findById(req.user._id).select("cart").populate("cart.items.product");
    res.status(HTTP_STATUS.OK).json(fresh.cart);
  } catch (err) {
    next(err);
  }
};

export const removeCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const user = await User.findById(req.user._id);
    if (!user.cart) user.cart = { items: [] };

    const item = user.cart.items.id(itemId);
    if (!item) return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Cart item not found" });
    item.deleteOne();

    await user.save();
    const fresh = await User.findById(req.user._id).select("cart").populate("cart.items.product");
    res.status(HTTP_STATUS.OK).json(fresh.cart);
  } catch (err) {
    next(err);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.cart = { items: [] };
    await user.save();
    res.status(HTTP_STATUS.OK).json(user.cart);
  } catch (err) {
    next(err);
  }
};