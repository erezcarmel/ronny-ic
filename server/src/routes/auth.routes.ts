import express from 'express';
import { login, refreshToken, register } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Authentication routes
router.post('/login', login);
router.post('/refresh-token', refreshToken);

// Protected routes - only for initial setup or by super admin
router.post('/register', authenticate, register);

export default router;