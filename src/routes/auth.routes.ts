import { Router } from 'express';
import { authController, registerSchema } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate';

const router = Router();

// 注册
router.post('/register', validate(registerSchema, 'body'), authController.register);

export default router;
