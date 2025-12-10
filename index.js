import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.raw({ type: "application/json" })); // raw body for Shopify

function verifyShopifyWebhook(req, res, next) {
  const shopifyHmac = req.headers["x-shopify-hmac-sha256"];
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;

  const digest = crypto
    .createHmac("sha256", secret)
    .update(req.body)
    .digest("base64");

  if (digest !== shopifyHmac) return res.status(401).send("Unauthorized");

  next();
}

app.post("/webhook/orders-create", verifyShopifyWebhook, (req, res) => {
  const body = JSON.parse(req.body.toString());
  console.log("New Order Webhook Received:", body);
  res.status(200).send("Webhook received");
});

app.get("/", (req, res) => res.send("Server running"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
