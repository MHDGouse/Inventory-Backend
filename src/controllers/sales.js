import Sales from '../modules/sales.js';
import Product from '../modules/Produt.js';
import mongoose from 'mongoose';

// Add multiple sales
export const addSale = async (req, res) => {
  const items = req.body; // Expecting an array
  console.log("Request body:", items);

  if (!Array.isArray(items)) {
    return res.status(400).json({ message: 'Request body should be an array' });
  }

  try {
    const salesRecords = [];

    // Generate a unique transaction ID
    const transactionId = new mongoose.Types.ObjectId().toString();

    for (const item of items) {
      const { productId, name, quantity, customerType,totalPrice } = item;

      const product = await Product.findById(productId);
      if (!product) {
        console.warn(`Product not found: ${productId}`);
        continue;
      }



      // Create sale record
      const sale = new Sales({
        product: product._id,
        name,
        quantity,
        totalPrice,
        customerType,
        transactionId  // Add the same transaction ID to all items in this request
      });

      await sale.save();
      await product.save();

      salesRecords.push(sale);
    }

    res.status(201).json({ message: 'Sales recorded', sales: salesRecords });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: 'Error recording sales', error });
  }
};

// Get all sales
export const getSales = async (req, res) => {
  try {
    const sales = await Sales.find().populate('product');
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
    }).populate('product');

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
    }).populate('product').sort({ saleDate: -1 });

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
    ).populate('product');
    
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