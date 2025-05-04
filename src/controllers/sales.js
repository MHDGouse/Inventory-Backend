import Sales from '../modules/sales.js';
import Product from '../modules/Produt.js';

// Add a sale
export const addSale = async (req, res) => {
  const { productId, quantity, customerType } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Choose price based on customer type
    const price = customerType === 'shopkeeper' ? product.sellingPriceShopkeeper : product.sellingPrice;
    const totalPrice = price * quantity;

    // Create sale record
    const sale = new Sales({
      product: product._id,
      quantity,
      totalPrice,
      customerType
    });

    await sale.save();

    // Optionally, update product quantity in stock
    product.quantity = product.quantity - quantity;
    await product.save();

    res.status(201).json({ message: 'Sale recorded', sale });
  } catch (error) {
    res.status(500).json({ message: 'Error recording sale', error });
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