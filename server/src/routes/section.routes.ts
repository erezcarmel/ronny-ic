import express from 'express';
import { 
  getAllSections, 
  getSectionById, 
  createSection, 
  updateSection, 
  deleteSection 
} from '../controllers/section.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Public routes
router.get('/', getAllSections);
router.get('/:id', getSectionById);

// Protected routes (admin only)
router.post('/', authenticate, createSection);
router.put('/:id', authenticate, updateSection);
router.delete('/:id', authenticate, deleteSection);

export default router;