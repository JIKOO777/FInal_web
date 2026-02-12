import Order from "../models/Order.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";

const calcTotal = (items) => items.reduce((sum, it) => sum + (it.price || 0) * (it.quantity || 0), 0);

export const createOrderFromCart = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate("cart.items.product");
    const cartItems = user?.cart?.items || [];
    if (cartItems.length === 0) return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Cart is empty" });

    const items = cartItems.map((ci) => ({
      product: ci.product._id,
      size: ci.size,
      color: ci.color,
      quantity: ci.quantity,
      price: ci.product.price
    }));

    const totalPrice = calcTotal(items);

    const order = await Order.create({
      user: req.user._id,
      items,
      totalPrice,
      status: "NEW"
    });

    // очищаем корзину после заказа
    user.cart = { items: [] };
    await user.save();

    const populated = await Order.findById(order._id)
      .populate("user", "name email role")
      .populate("items.product");

    res.status(HTTP_STATUS.CREATED).json(populated);
  } catch (err) {
    next(err);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "10", 10), 1), 100);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Order.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("items.product"),
      Order.countDocuments({ user: req.user._id })
    ]);

    res.status(HTTP_STATUS.OK).json({ items, page, limit, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate("items.product").populate("user", "name email role");
    if (!order) return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Order not found" });

    // owner access: пользователь может видеть только свои заказы
    if (req.user.role !== "ADMIN" && String(order.user?._id) !== String(req.user._id)) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({ message: "Forbidden" });
    }

    res.status(HTTP_STATUS.OK).json(order);
  } catch (err) {
    next(err);
  }
};

// ADMIN
export const getAllOrders = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "10", 10), 1), 100);
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const [items, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("user", "name email role"),
      Order.countDocuments(filter)
    ]);

    res.status(HTTP_STATUS.OK).json({ items, page, limit, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ["NEW", "PAID", "SHIPPED", "CANCELLED"];
    if (!allowed.includes(status)) return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Invalid status" });

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Order not found" });

    order.status = status;
    await order.save();

    const populated = await Order.findById(order._id)
      .populate("items.product")
      .populate("user", "name email role");

    res.status(HTTP_STATUS.OK).json(populated);
  } catch (err) {
    next(err);
  }
};