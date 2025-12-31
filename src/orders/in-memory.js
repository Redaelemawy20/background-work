const express = require("express");
const router = express.Router();

const orders = {};

function processOrder(orderId) {
  console.log("Processing order:", orderId);

  setTimeout(() => {
    const success = Math.random() > 0.5;
    const status = success ? "SUCCESS" : "FAILED";
    orders[orderId].status = status;
    if (status === "FAILED") {
      orders[orderId].error = "Order failed because of insufficient inventory";
    } else {
      orders[orderId].message =
        "Order completed successfully and will be shipped soon";
    }
    console.log("Order result:", orderId, orders[orderId].status);
  }, 20000); // Simulate a 20-second delay
}

router.get("", (req, res) => {
  res.json(orders);
});

router.post("/", (req, res) => {
  const orderId = Date.now().toString();

  orders[orderId] = {
    id: orderId,
    status: "PENDING",
  };

  processOrder(orderId);

  res.json({ orderId });
});

module.exports = router;
