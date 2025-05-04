import mongoose, { Schema } from 'mongoose';
const inventorySchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Products', required: true },
  quantity: { type: Number, required: true },
  addedDate: { type: Date, default: Date.now },
  expiryDate: { type: Date }
},{
  timestamps: true});

const Inventory = mongoose.model('Inventory', inventorySchema);

export default Inventory;