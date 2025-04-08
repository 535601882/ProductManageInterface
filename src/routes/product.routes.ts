import { Router } from 'express';
import {
  productController,
  createProductSchema,
  updateProductSchema,
} from '../controllers/product.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/rbac.middleware';
import { validate } from '../middlewares/validate';

const router = Router();

router.post('/', authMiddleware, requirePermission('product:create'), validate(createProductSchema, 'body'), productController.create);
router.get('/', productController.findAll);
router.get('/:id', productController.findById);
router.put('/:id', authMiddleware, requirePermission('product:update'), validate(updateProductSchema, 'body'), productController.update);
router.delete('/:id', authMiddleware, requirePermission('product:delete'), productController.delete);

export default router;
