import mongoose, { Schema } from 'mongoose';

const productSchema = new Schema({
    barcode: { type: String, unique: true },
    name: { type: String, required: true },
    category: { 
      type: String, 
      required: true, 
      enum: ['Milk', 'Curd', 'Ice-Cream', 'Juice', 'Paneer', 'Other'], // Add more as needed
    },
    quantity: { type: Number, default: 0 },
    unit: { 
      type: String, 
      required: true, 
      enum: ['liters','milliliter', 'grams', 'kilograms', 'units'], // Measurement units
      default: 'units',
    },
    image:{
      type: String,
    },
    price: { type: Number, }, // Price you buy it for
    sellingPrice: { type: Number, required: true }, // Price for normal customers
    sellingPriceShopkeeper: { type: Number, required: true }, // Discounted price for shopkeepers
    addedDate: { type: Date, default: Date.now }, // When it was added to inventory
  expiryDate:{ type:Date}
})
const product= mongoose.model("Products", productSchema);

export default product;
