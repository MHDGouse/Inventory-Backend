import mongoose, { Schema } from 'mongoose';

const salesSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Products', required: true },
  quantity: { type: Number, required: true },
  saleDate: { type: Date, default: Date.now },
  totalPrice: { type: Number, required: true },
  customerType: { type: String, enum: ['normal', 'shopkeeper'], default: 'normal' }
});

const Sales = mongoose.model('Sales', salesSchema);

export default Sales;