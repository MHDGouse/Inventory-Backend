import express from "express";
const router = express.Router();

import { 
  addToInventory,
  getInventory,
  editInventory,
  deleteInventory
} from "../controllers/inventory.js";

// Route to add product to inventory
router.post("/add", addToInventory);

// Route to get all products in inventory
router.get("/", getInventory);

// Route to edit inventory item by id
router.put("/edit/:id", editInventory);

// Route to delete inventory item by id
router.delete("/delete/:id", deleteInventory);

export default router;