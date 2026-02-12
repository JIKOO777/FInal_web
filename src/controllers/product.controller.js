import Product from "../models/Product.js";
import Category from "../models/Category.js";

export const getProducts = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "20", 10), 1), 100);
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.active === "true") filter.isActive = true;
    if (req.query.active === "false") filter.isActive = false;

    if (req.query.category) {
      // category может быть id или slug
      const cat = await Category.findOne({
        $or: [{ _id: req.query.category }, { slug: req.query.category }]
      }).catch(() => null);
      if (cat) filter.category = cat._id;
      else filter.category = req.query.category; // попробуем как id
    }

    if (req.query.q) {
      const q = String(req.query.q).trim();
      filter.$or = [{ title: { $regex: q, $options: "i" } }, { description: { $regex: q, $options: "i" } }];
    }

    // Фильтр по цене: ?minPrice=1000&maxPrice=5000
    const minPrice = req.query.minPrice !== undefined ? Number(req.query.minPrice) : null;
    const maxPrice = req.query.maxPrice !== undefined ? Number(req.query.maxPrice) : null;
    if (!Number.isNaN(minPrice) && minPrice !== null) {
      filter.price = { ...(filter.price || {}), $gte: minPrice };
    }
    if (!Number.isNaN(maxPrice) && maxPrice !== null) {
      filter.price = { ...(filter.price || {}), $lte: maxPrice };
    }

    const sort = {};
    if (req.query.sort === "price_asc") sort.price = 1;
    else if (req.query.sort === "price_desc") sort.price = -1;
    else sort.createdAt = -1;

    const [items, total] = await Promise.all([
      Product.find(filter).populate("category").sort(sort).skip(skip).limit(limit),
      Product.countDocuments(filter)
    ]);

    res.json({ items, page, limit, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const { title, price, description, sizes, colors, images, category, isActive } = req.body;
    if (!title) return res.status(400).json({ message: "title is required" });
    if (price === undefined) return res.status(400).json({ message: "price is required" });
    if (!category) return res.status(400).json({ message: "category is required" });

    const cat = await Category.findById(category);
    if (!cat) return res.status(400).json({ message: "Invalid category" });

    const product = await Product.create({
      title,
      price,
      description,
      sizes: Array.isArray(sizes) ? sizes : sizes ? [sizes] : [],
      colors: Array.isArray(colors) ? colors : colors ? [colors] : [],
      images: Array.isArray(images) ? images : images ? [images] : [],
      category,
      isActive
    });

    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const { title, price, description, sizes, colors, images, category, isActive } = req.body;

    if (title !== undefined) product.title = title;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = price;
    if (isActive !== undefined) product.isActive = isActive;

    if (category !== undefined) {
      const cat = await Category.findById(category);
      if (!cat) return res.status(400).json({ message: "Invalid category" });
      product.category = category;
    }

    if (sizes !== undefined) product.sizes = Array.isArray(sizes) ? sizes : sizes ? [sizes] : [];
    if (colors !== undefined) product.colors = Array.isArray(colors) ? colors : colors ? [colors] : [];
    if (images !== undefined) product.images = Array.isArray(images) ? images : images ? [images] : [];

    await product.save();
    res.json(product);
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    await product.deleteOne();
    res.json({ message: "Product deleted" });
  } catch (err) {
    next(err);
  }
};
