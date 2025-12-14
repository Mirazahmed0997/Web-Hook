import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json()); // parse JSON bodies

app.post("/apps/cod-order", (req, res) => {
  const body = req.body;
  console.log("New COD Order Received:", body);
  res.status(200).json({ success: true, received: body });
});

app.get("/", (req, res) => res.send("Server running"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
