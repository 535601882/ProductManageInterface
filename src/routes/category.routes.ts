import { Router } from 'express';
import {
  categoryController,
  createCategorySchema,
  updateCategorySchema,
} from '../controllers/category.controller';
import { validate } from '../middlewares/validate';

const router = Router();

router.post('/', validate(createCategorySchema, 'body'), categoryController.create);
router.get('/', categoryController.findAll);
router.get('/:id', categoryController.findById);
router.put('/:id', validate(updateCategorySchema, 'body'), categoryController.update);
router.delete('/:id', categoryController.delete);

export default router;
