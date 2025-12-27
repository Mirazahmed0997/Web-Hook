




import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: true,       
    credentials: true, 
  })
);

app.use(express.json());


const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI) 
  .then(() => console.log(" MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));


const orderSchema = new mongoose.Schema({}, { strict: false }); 
const Order = mongoose.model("Order", orderSchema);


app.post("/apps/cod-order", async (req, res) => {
  try {
    const body = req.body;
    console.log("New COD Order Received:", body);

    const order = new Order(body);  
    await order.save();

    res.status(200).json({ success: true, received: body, message: "Order saved to DB " });
  } catch (err) {
    console.error("Error saving order:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// app.get("/apps/cod-order", async (req, res) => {
//   try {
//     const orders = await Order.find().sort({ created_at: -1 }); // latest first
//     res.status(200).json({ success: true, orders });
//   } catch (err) {
//     console.error("Error fetching orders:", err);
//     res.status(500).json({ success: false, error: err.message });
//   }
// });



app.get("/apps/cod-order", async (req, res) => {
  try {
    // Flexible: Accept both page/limit OR skip/limit
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;

    // If frontend uses skip instead of page
    if (req.query.skip !== undefined) {
      const skip = parseInt(req.query.skip) || 0;
      page = Math.floor(skip / limit) + 1;
    }

    const skip = (page - 1) * limit;

    const search = (req.query.search || "").trim();
    const sortBy = req.query.sortBy || "createdAt"; // use createdAt (Mongo auto field)
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    // Search query
    let searchQuery = {};
    if (search) {
      searchQuery = {
        $or: [
          { "customer.name": { $regex: search, $options: "i" } },
          { "customer.phone": { $regex: search, $options: "i" } },
          { "main_product.title": { $regex: search, $options: "i" } },
        ],
      };
    }

    // Fetch data
    const [orders, total] = await Promise.all([
      Order.find(searchQuery)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(searchQuery),
    ]);

    // Always return pagination info (safe even when total = 0)
    const totalPages = total > 0 ? Math.ceil(total / limit) : 1;

    res.json({
      success: true,
      orders,
      pagination: {
        currentPage: page,
        totalPages,
        totalOrders: total,
        limit,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});



// GET /apps/cod-order/:id
app.get("/apps/cod-order/:id", async (req, res) => {
  try {
    const { id } = req.params;

    console.log(id)

    const order = await Order.findById(id);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, order });
  } catch (err) {
    console.error("Error fetching single order:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});



app.get("/", (req, res) => res.send("Server running"));


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
