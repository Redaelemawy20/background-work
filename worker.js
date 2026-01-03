const redis = require("redis");
const jsonStorage = require("./src/orders/json-storage");

// Create Redis client for subscribing
const redisSubscriber = redis.createClient({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
});

// Channel name for order events
const ORDER_CHANNEL = "order:created";

// Connect to Redis
redisSubscriber.on("error", (err) => {
  console.error("Redis Subscriber Error:", err);
});

redisSubscriber.on("connect", () => {
  console.log("Redis Subscriber Connected");
});

// Process order (simulate background work)
async function processOrder(orderId) {
  console.log(`[Worker] Processing order: ${orderId}`);

  try {
    // Update status to PROCESSING
    await jsonStorage.updateOrder(orderId, {
      status: "PROCESSING",
      processedAt: new Date().toISOString(),
    });

    // Simulate background work (20 seconds delay)
    setTimeout(async () => {
      const success = Math.random() > 0.5;
      const status = success ? "SUCCESS" : "FAILED";
      const updates = {
        status,
        completedAt: new Date().toISOString(),
      };

      if (status === "FAILED") {
        updates.error = "Order failed because of insufficient inventory";
      } else {
        updates.message =
          "Order completed successfully and will be shipped soon";
      }

      await jsonStorage.updateOrder(orderId, updates);
      console.log(`[Worker] Order ${orderId} completed with status: ${status}`);
    }, 20000); // 20 seconds delay
  } catch (error) {
    console.error(`[Worker] Error processing order ${orderId}:`, error);
    try {
      await jsonStorage.updateOrder(orderId, {
        status: "FAILED",
        error: error.message,
        completedAt: new Date().toISOString(),
      });
    } catch (updateError) {
      console.error(`[Worker] Failed to update order status:`, updateError);
    }
  }
}

// Handle incoming messages
async function handleMessage(message) {
  try {
    const data = JSON.parse(message);
    if (data.orderId) {
      await processOrder(data.orderId);
    }
  } catch (error) {
    console.error("[Worker] Error handling message:", error);
  }
}

// Start the worker
async function startWorker() {
  try {
    await redisSubscriber.connect();
    console.log("[Worker] Connected to Redis");

    // Subscribe to order creation channel
    await redisSubscriber.subscribe(ORDER_CHANNEL, (message) => {
      console.log(`[Worker] Received message: ${message}`);
      handleMessage(message);
    });

    console.log(`[Worker] Subscribed to channel: ${ORDER_CHANNEL}`);
    console.log("[Worker] Waiting for order events...");
  } catch (error) {
    console.error("[Worker] Failed to start:", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n[Worker] Shutting down gracefully...");
  await redisSubscriber.quit();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n[Worker] Shutting down gracefully...");
  await redisSubscriber.quit();
  process.exit(0);
});

// Start the worker
startWorker();
