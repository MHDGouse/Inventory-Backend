import Sales from '../modules/sales.js';
import Product from '../modules/Produt.js';

// Add multiple sales
export const addSale = async (req, res) => {
  const items = req.body; // Expecting an array
  console.log("Request body:", items);

  if (!Array.isArray(items)) {
    return res.status(400).json({ message: 'Request body should be an array' });
  }

  try {
    const salesRecords = [];

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
        customerType
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