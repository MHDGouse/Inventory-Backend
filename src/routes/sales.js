import express from "express";
const router = express.Router();

import { 
  addSale, 
  getSales, 
  getSalesByDate,
  getSalesByDateRange,
  deleteSale,
  editSale 
} from "../controllers/sales.js";

// Add a sale
router.post("/add", addSale);

// Get all sales
router.get("/", getSales);

// Get sales by specific date
router.get("/date/:date", getSalesByDate);

// Get sales by date range
router.get("/date-range", getSalesByDateRange);

// Delete a sale by id
router.delete("/delete/:id", deleteSale);

// Edit a sale by id
router.put("/edit/:id", editSale);

export default router;