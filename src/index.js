import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import ConnectDB from "./config/db.js";
import products from "./routes/product.js";

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
      origin: "http://localhost:3000",
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true
    })
  );
  app.use(express.json()); // JSON parsing AFTER CORS

// Routes for product operations
app.use("/api/V1/products", products);

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
