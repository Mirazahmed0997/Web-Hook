import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173", 
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

app.get("/apps/cod-order", async (req, res) => {
  try {
    const orders = await Order.find().sort({ created_at: -1 }); // latest first
    res.status(200).json({ success: true, orders });
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ success: false, error: err.message });
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
