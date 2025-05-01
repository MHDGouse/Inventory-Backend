import express from 'express'
import { addproducts, getAllProducts, registerProducts,updateProduct, getDetailById} from '../controllers/products.js';

const router = express.Router();

router.post('/register', registerProducts);

router.get('/all', getAllProducts);

router.get('/:id', getDetailById);

router.post('/add', addproducts);

router.put('/update/:id', updateProduct);



// router.use('/:barcode', getDetailByBarcode);

export default router