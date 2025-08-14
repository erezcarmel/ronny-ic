import express from 'express';
import { sendContactMessage, getContactInfo, updateContactInfo } from '../controllers/contact.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Public routes
router.post('/send', sendContactMessage);
router.get('/info', getContactInfo);

// Protected routes (admin only)
router.put('/info', authenticate, updateContactInfo);

export default router;