const express = require("express");
const inMemoryOrders = require("./orders/in-memory");
const redisOrders = require("./orders/redis");
const router = express.Router();

router.use("/in-memory-orders", inMemoryOrders);
router.use("/redis-orders", redisOrders);

module.exports = router;
