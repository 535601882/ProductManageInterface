import { Router } from 'express';
import { userController, updateUserSchema } from '../controllers/user.controller';
import { validate } from '../middlewares/validate';

const router = Router();

router.get('/', userController.findAll);
router.get('/:id', userController.findById);
router.put('/:id', validate(updateUserSchema, 'body'), userController.update);
router.delete('/:id', userController.delete);

export default router;
