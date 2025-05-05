import { Router } from 'express';
import { orderController, createOrderSchema } from '../controllers/order.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate';

const router = Router();

router.post('/', authMiddleware, validate(createOrderSchema, 'body'), orderController.create);
router.get('/', authMiddleware, orderController.findAll);
router.get('/:id', authMiddleware, orderController.findById);
router.put('/:id/pay', authMiddleware, orderController.pay);

export default router;
