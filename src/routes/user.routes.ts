import { Router } from 'express';
import { userController, updateUserSchema } from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/rbac.middleware';
import { validate } from '../middlewares/validate';

const router = Router();

router.get('/', authMiddleware, userController.findAll);
router.get('/:id', authMiddleware, userController.findById);
router.put('/:id', authMiddleware, validate(updateUserSchema, 'body'), userController.update);
router.delete('/:id', authMiddleware, requirePermission('user:delete'), userController.delete);

export default router;
