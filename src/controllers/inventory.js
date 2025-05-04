import Inventory from '../modules/inventory.js';
import Product from '../modules/Produt.js';

// Add product to inventory with expiry date using product id
export const addToInventory = async (req, res) => {
  const { id, quantity, expiryDate } = req.body;

  console.log("Adding to inventory", req.body);
  try {
    // Find product by _id
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found. Please register it first.' });
    }

    const inventoryItem = new Inventory({
      product: product._id,
      quantity,
      expiryDate
    });

    await inventoryItem.save();
    res.status(201).json({ message: 'Product added to inventory', inventory: inventoryItem });
  } catch (error) {
    res.status(500).json({ message: 'Error adding to inventory', error });
  }
};

// Get all inventory items
export const getInventory = async (req, res) => {
  try {
    const inventory = await Inventory.find().populate('product');
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching inventory', error });
  }
};

// Edit inventory item by inventory id
export const editInventory = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const updatedInventory = await Inventory.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('product');
    if (!updatedInventory) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    res.json({ message: 'Inventory updated successfully', inventory: updatedInventory });
  } catch (error) {
    res.status(500).json({ message: 'Error updating inventory', error });
  }
};

// Delete inventory item by inventory id
export const deleteInventory = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedInventory = await Inventory.findByIdAndDelete(id);
    if (!deletedInventory) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    res.json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting inventory', error });
  }
};