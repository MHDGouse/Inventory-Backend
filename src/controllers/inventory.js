import Inventory from '../modules/inventory.js';
import Product from '../modules/Produt.js';

export const addToInventory = async (req, res) => {
  const items = req.body; // Expecting an array
  console.log("Request body:", items);

  if (!Array.isArray(items)) {
    return res.status(400).json({ message: 'Request body should be an array' });
  }

  try {
    const inventoryItems = [];

    for (const item of items) {
      const { productId, name, quantity, quantityPrice, type, returnQuantity, returnAmount, totalPrice, profit,addedDate } = item;

      // Validate mandatory fields
      if (!name || !quantity) {
        console.warn(`Missing mandatory fields: name and quantity are required`);
        continue;
      }

      // Only require product lookup if productId is provided
      let product = null;
      if (productId) {
        product = await Product.findById(productId);
        if (!product) {
          console.warn(`Product not found: ${productId}`);
          continue;
        }
      }

      const inventoryItem = new Inventory({
        ...(product && { product: product._id }),
        name,
        quantity,
        addedDate,
        ...(quantityPrice !== undefined && { quantityPrice }),
        ...(returnQuantity !== undefined && { returnQuantity }),
        ...(returnAmount !== undefined && { returnAmount }),
        ...(totalPrice !== undefined && { totalPrice }),
        ...(profit !== undefined && { profit }),
        ...(type !== undefined && { type })
      });

      console.log("Saving inventory item:", inventoryItem);
      await inventoryItem.save();
      inventoryItems.push(inventoryItem);
    }

    res.status(201).json({ message: 'Products added to inventory', inventory: inventoryItems });
  } catch (error) {
    console.error("Error:", error);
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

// Get inventory items by date and group into shop/van
export const getInventoryByDate = async (req, res) => {
  const { date } = req.params; // Expecting date in YYYY-MM-DD format

  try {
    // Create date range for the entire day
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1); // Next day

    const inventory = await Inventory.aggregate([
      {
        $match: {
          addedDate: { $gte: startDate, $lt: endDate }
        }
      },
     {
  $facet: {
    shop: [
      { $match: { type: "shop" } },
      {
        $lookup: {
          from: "products",              // name of your products collection
          localField: "product",         // field in inventory doc (ObjectId ref)
          foreignField: "_id",           // match _id in products
          as: "product"
        }
      },
      { $unwind: "$product" },           // flatten array result
      {
        $project: {
          _id: 1,
          name: 1,
          quantity: 1,
          quantityPrice: 1,
          totalPrice: 1,
          profit: 1,
          returnQuantity: 1,
          returnAmount: 1,
          // pull category + units from joined product doc
          category: "$product.category",
          units: "$product.units",
          retailPrice: "$product.retailPrice",
          wholeSalePrice: "$product.wholeSalePrice"
        }
      }
    ],
    van: [
      { $match: { type: "van" } },
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },
      {
        $project: {
          _id: 1,
          name: 1,
          quantity: 1,
          quantityPrice: 1,
          totalPrice: 1,
          profit: 1,
          returnQuantity: 1,
          returnAmount: 1,
          category: "$product.category",
          units: "$product.units",
           retailPrice: "$product.retailPrice",
          wholeSalePrice: "$product.wholeSalePrice"
        }
      }
    ]
  }
}

    ]);

    if (!inventory.length) {
      return res.status(404).json({ message: `No inventory items found for ${date}` });
    }

    res.json({
      message: `Inventory items for ${date}`,
      shop: inventory[0].shop,
      van: inventory[0].van
    });
  } catch (error) {
    console.error("Error fetching inventory by date:", error);
    res.status(500).json({ message: "Error fetching inventory by date", error });
  }
};


// Get inventory items by date range
export const getInventoryByDateRange = async (req, res) => {
  const { startDate, endDate } = req.query; // Expecting ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD

  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setDate(end.getDate() + 1); // Include the end date

    const inventory = await Inventory.find({
      addedDate: {
        $gte: start,
        $lt: end
      }
    }).populate('product').sort({ addedDate: -1 });

    res.json({ 
      message: `Inventory items from ${startDate} to ${endDate}`, 
      count: inventory.length,
      inventory 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching inventory by date range', error });
  }
};


