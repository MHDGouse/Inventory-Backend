import Product from '../modules/Produt.js';

// Register a new product - Arrow Function
export const registerProducts = async (req, res) => {
  const {
    barcode,
    name,
    category,
    unit,
    price,
    sellingPrice,
    sellingPriceShopkeeper,
    image,
  } = req.body;

  console.log("Received data:", req.body);

  try {
    const existingProduct = await Product.findOne({ barcode });
    if (existingProduct) {
      return res.status(400).json({ message: 'Product with this barcode already exists' });
    }

    const product = new Product({
      barcode,
      name,
      category,
      unit,
      price,
      sellingPrice,
      sellingPriceShopkeeper,
      image,
    });

    const savedProduct = await product.save();
    console.log("Saved product:", savedProduct);

    res.status(201).json({ message: 'Product registered successfully', product: savedProduct });
  } catch (error) {
    console.error("Error registering product:", error);
    res.status(500).json({ message: 'Error registering product', error });
  }
};

// Get all products
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error });
  }
};



// Get product details by barcode || name
export const getDetailById = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findById( id );
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error });
  }
};

// Update product by id
export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
       id ,
      updateData,
      { new: true }
    );
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product updated successfully', product: updatedProduct });
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error });
  }
};
