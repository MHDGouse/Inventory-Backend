import mongoose, { Schema } from 'mongoose';

const productSchema = new Schema({
    barcode: { type: String, unique: true },
    name: { type: String, required: true },
    category: { 
      type: String, 
      required: true, 
      enum: ['milk', 'curd', 'ice-cream', 'juice', 'paneer', 'other'], // Add more as needed
    },
    units: { 
      type: String, 
      required: true, 
      enum: ['liters','cans'], // Measurement units
      default: 'units',
    },
    image:{
      type: String,
    },
    costPrice: { type: Number, }, // Price you buy it for
    retailPrice: { type: Number, required: true}, // Price for normal customers
    wholeSalePrice: { type: Number, required: true }, // Discounted price for shopkeepers
})
const product= mongoose.model("Products", productSchema);

export default product;
