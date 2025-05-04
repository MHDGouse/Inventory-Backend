import express from "express";
const router = express.Router();

import { addSale, getSales, deleteSale } from "../controllers/sales.js";

// Add a sale
router.post("/add", addSale);

// Get all sales
router.get("/", getSales);

// Delete a sale by id
router.delete("/delete/:id", deleteSale);

export default router;