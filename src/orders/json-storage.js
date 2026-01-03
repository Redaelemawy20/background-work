const fs = require("fs").promises;
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "..", "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    if (error.code !== "EEXIST") {
      throw error;
    }
  }
}

// Read all orders from JSON file
async function readOrders() {
  await ensureDataDir();
  try {
    const data = await fs.readFile(ORDERS_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      // File doesn't exist yet, return empty array
      return [];
    }
    throw error;
  }
}

// Write orders to JSON file
async function writeOrders(orders) {
  await ensureDataDir();
  await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf8");
}

// Get a single order by ID
async function getOrderById(orderId) {
  const orders = await readOrders();
  return orders.find((order) => order.id === orderId);
}

// Create a new order
async function createOrder(order) {
  const orders = await readOrders();
  orders.push(order);
  await writeOrders(orders);
  return order;
}

// Update an existing order
async function updateOrder(orderId, updates) {
  const orders = await readOrders();
  const index = orders.findIndex((order) => order.id === orderId);
  if (index === -1) {
    throw new Error(`Order ${orderId} not found`);
  }
  orders[index] = { ...orders[index], ...updates };
  await writeOrders(orders);
  return orders[index];
}

// Get all orders
async function getAllOrders() {
  return await readOrders();
}

module.exports = {
  createOrder,
  getOrderById,
  updateOrder,
  getAllOrders,
  readOrders,
  writeOrders,
};
