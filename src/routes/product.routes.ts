import { Router } from 'express';
import {
  productController,
  createProductSchema,
  updateProductSchema,
} from '../controllers/product.controller';
import { validate } from '../middlewares/validate';

const router = Router();

router.post('/', validate(createProductSchema, 'body'), productController.create);
router.get('/', productController.findAll);
router.get('/:id', productController.findById);
router.put('/:id', validate(updateProductSchema, 'body'), productController.update);
router.delete('/:id', productController.delete);

export default router;
