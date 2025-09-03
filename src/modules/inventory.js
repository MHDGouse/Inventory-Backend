import mongoose, { Schema } from 'mongoose';

const inventorySchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Products', required: true },
  name:{ type: String, required: true },
  quantity: { type: Number, required: true },
  quantityPrice: { type: Number },
  returnQuantity: { type: Number },
  returnAmount: { type: Number },
  totalPrice: { type: Number },
  profit: { type: Number, },
  addedDate: { type: Date, default: Date.now },
  type: {
    type: String,
    enum: ['shop', 'van'],
    required: true,
  }
},{
  timestamps: true});

const Inventory = mongoose.model('Inventory', inventorySchema);

export default Inventory;