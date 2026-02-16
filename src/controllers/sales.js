import Sales from '../modules/sales.js';
import Product from '../modules/Produt.js';
import mongoose from 'mongoose';


// Add multiple sales
export const addSale = async (req, res) => {
  const items = req.body; // Expecting an array
  console.log("Request body:", items);

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Request body should be a non-empty array' });
  }

  try {
    const transactionItems = [];
    // Generate a unique transaction ID for this batch
    const transactionId = new mongoose.Types.ObjectId().toString();

    for (const item of items) {
      const { productId, name, quantity, customerType, totalPrice } = item;

      const product = await Product.findById(productId);
      if (!product) {
        console.warn(`Product not found: ${productId}`);
        continue;
      }

      transactionItems.push({
        product: product._id,
        name,
        quantity,
        totalPrice,
        customerType
      });
      // Note: Product stock update logic was missing in original code, skipping here as well/
    }

    if (transactionItems.length === 0) {
      return res.status(400).json({ message: 'No valid products to record' });
    }

    // Create a SINGLE sale record for the transaction containing all items
    const sale = new Sales({
      transaction: transactionItems,
      transactionId: transactionId
    });

    await sale.save();

    res.status(201).json({ message: 'Sales recorded', sale });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: 'Error recording sales', error });
  }
};

``
// Get all sales
export const getSales = async (req, res) => {
  try {
    const sales = await Sales.find().populate('transaction.product');
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sales', error });
  }
};

// Get sales by date
export const getSalesByDate = async (req, res) => {
  const { date } = req.params; // Expecting date in YYYY-MM-DD format

  try {
    // Create date range for the entire day
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1); // Next day

    const sales = await Sales.find({
      saleDate: {
        $gte: startDate,
        $lt: endDate
      }
    }).populate('transaction.product');

    if (sales.length === 0) {
      return res.status(404).json({ message: 'No sales found for this date' });
    }

    res.json({
      message: `Sales for ${date}`,
      count: sales.length,
      sales
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sales by date', error });
  }
};

// Get sales by date range
export const getSalesByDateRange = async (req, res) => {
  const { startDate, endDate } = req.query; // Expecting ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD

  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setDate(end.getDate() + 1); // Include the end date

    const sales = await Sales.find({
      saleDate: {
        $gte: start,
        $lt: end
      }
    }).populate('transaction.product').sort({ saleDate: -1 });

    res.json({
      message: `Sales from ${startDate} to ${endDate}`,
      count: sales.length,
      sales
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sales by date range', error });
  }
};

// Delete a sale by id
export const deleteSale = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedSale = await Sales.findByIdAndDelete(id);
    if (!deletedSale) {
      return res.status(404).json({ message: 'Sale not found' });
    }
    res.json({ message: 'Sale deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting sale', error });
  }
};

// Edit a sale by id
export const editSale = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const updatedSale = await Sales.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('transaction.product');

    if (!updatedSale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    res.json({
      message: 'Sale updated successfully',
      sale: updatedSale
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: 'Error updating sale', error });
  }
};