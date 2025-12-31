const express = require("express");
const inMemoryOrders = require("./orders/in-memory");
const router = express.Router();

router.use("/in-memory-orders", inMemoryOrders);

module.exports = router;
