import mongoose, { Schema } from 'mongoose';

const salesSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Products', required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  saleDate: { type: Date, default: Date.now },
  totalPrice: { type: Number, required: true },
  customerType: { type: String, enum: ['retail', 'wholesale'], default: 'retail' }
});

const Sales = mongoose.model('Sales', salesSchema);

export default Sales;