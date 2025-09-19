import mongoose, { Schema } from 'mongoose';

const salesSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Products', required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  customerType: { type: String },
  saleDate: { type: Date, default: Date.now },
  transactionId: { type: String }  // Add this field
});

const Sales = mongoose.model('Sales', salesSchema);

export default Sales;