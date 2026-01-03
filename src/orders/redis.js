const express = require("express");
const redis = require("redis");
const jsonStorage = require("./json-storage");
const router = express.Router();

// Create Redis client
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
});

// Connect to Redis
redisClient.on("error", (err) => {
  console.error("Redis Client Error:", err);
});

redisClient.on("connect", () => {
  console.log("Redis Client Connected");
});

// Connect to Redis (async)
(async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error("Failed to connect to Redis:", error);
  }
})();

// Channel name for order events
const ORDER_CHANNEL = "order:created";

// GET all orders from JSON file
router.get("", async (req, res) => {
  try {
    const orders = await jsonStorage.getAllOrders();
    // Convert array to object format for consistency with in-memory API
    const ordersObj = {};
    orders.forEach((order) => {
      ordersObj[order.id] = order;
    });
    res.json(ordersObj);
  } catch (error) {
    console.error("Error reading orders:", error);
    res.status(500).json({ error: "Failed to read orders" });
  }
});

// POST create new order and publish to Redis
router.post("/", async (req, res) => {
  try {
    const orderId = Date.now().toString();
    const order = {
      id: orderId,
      status: "PENDING",
      createdAt: new Date().toISOString(),
      processedAt: null,
      completedAt: null,
    };

    // Store initial order in JSON file
    await jsonStorage.createOrder(order);

    // Publish order creation event to Redis
    try {
      await redisClient.publish(ORDER_CHANNEL, JSON.stringify({ orderId }));
      console.log(`Order ${orderId} created and published to Redis`);
    } catch (redisError) {
      console.error("Failed to publish to Redis:", redisError);
      // Order is still created in JSON file, so we continue
    }

    res.json({ orderId });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

module.exports = router;
