import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import ConnectDB from "./config/db.js";
import products from "./routes/product.js";
import inventory from "./routes/inventory.js";
import sales from "./routes/sales.js";

const app = express();

dotenv.config();
const port = process.env.PORT || 5000;

// Database Connection Improvement
ConnectDB().catch(err => {
    console.error("Database connection failed:", err);
    process.exit(1);
  });
  
  // Middleware Order Matters!
  app.use(
    cors({
      origin: ["http://localhost:3000","https://inventory-management-three-tau.vercel.app"],
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true
    })
  );
  app.use(express.json()); // JSON parsing AFTER CORS

// Routes for product operations
app.use("/api/V1/products", products);

// Routes for inventory operations
app.use("/api/V1/inventory", inventory);

// Routes for sales operations
app.use("/api/V1/sales", sales);


// Basic route for testing server status
app.get("/", (req, res) => {
  res.json({
    message: "Server running",
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on localhost:${port}`);
});
