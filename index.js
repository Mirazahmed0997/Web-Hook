import express from "express";
import cors from "cors";
import mongoose from "mongoose";

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// ✅ MongoDB connection (singleton)
let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
  console.log("MongoDB connected");
}

// Schema
const orderSchema = new mongoose.Schema({}, { strict: false });
const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

/* ------------------ ROUTES ------------------ */

// POST
app.post("/api/cod-order", async (req, res) => {
  try {
    await connectDB();

    const order = new Order(req.body);
    await order.save();

    res.json({ success: true, message: "Order saved" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET (list)
app.get("/api/cod-order", async (req, res) => {
  try {
    await connectDB();

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const search = (req.query.search || "").trim();

    let query = {};
    if (search) {
      query = {
        $or: [
          { "customer.name": { $regex: search, $options: "i" } },
          { "customer.phone": { $regex: search, $options: "i" } },
          { "main_product.title": { $regex: search, $options: "i" } },
        ],
      };
    }

    const [orders, total] = await Promise.all([
      Order.find(query).sort({ created_at: -1 }).skip(skip).limit(limit),
      Order.countDocuments(query),
    ]);

    res.json({
      success: true,
      orders,
      pagination: {
        page,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET single
app.get("/api/cod-order/:id", async (req, res) => {
  try {
    await connectDB();

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false });
    }

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default app;
