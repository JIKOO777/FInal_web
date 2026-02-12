import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";

dotenv.config();

const SALT_ROUNDS = 10;

const run = async () => {
  await connectDB();

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || "Admin";

  if (!email || !password) {
    console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD in env");
    process.exit(1);
  }

  const existing = await User.findOne({ email });
  if (existing) {
    existing.role = "ADMIN";
    await existing.save();
    console.log("Updated existing user to ADMIN:", email);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  await User.create({ name, email, passwordHash, role: "ADMIN" });
  console.log("Created ADMIN user:", email);
  process.exit(0);
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
