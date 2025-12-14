import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json()); // parse JSON bodies


const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI) // no extra options needed
  .then(() => console.log(" MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));


const orderSchema = new mongoose.Schema({}, { strict: false }); // store anything
const Order = mongoose.model("Order", orderSchema);


app.post("/apps/cod-order", async (req, res) => {
  try {
    const body = req.body;
    console.log("New COD Order Received:", body);

    const order = new Order(body);  // store the whole payload
    await order.save();

    res.status(200).json({ success: true, received: body, message: "Order saved to DB ✅" });
  } catch (err) {
    console.error("Error saving order:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});


app.get("/", (req, res) => res.send("Server running"));


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
