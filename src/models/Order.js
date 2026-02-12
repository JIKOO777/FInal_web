import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    size: String,
    color: String,
    quantity: Number,
    price: Number
  }],

  totalPrice: Number,
  status: {
    type: String,
    enum: ["NEW", "PAID", "SHIPPED", "CANCELLED"],
    default: "NEW"
  }
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);
