const express = require("express");
const path = require("path");
const routes = require("./src/routes");
const app = express();
const PORT = 3000;

// Parse JSON request bodies
app.use(express.json());

// Serve static files from the public directory
app.use(express.static("public"));

// Route to serve the main HTML page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.use("/api", routes);
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
