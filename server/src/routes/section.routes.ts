import express from 'express';
import { 
  getAllSections, 
  getSectionById, 
  getSectionByType,
  createSection, 
  updateSection, 
  deleteSection 
} from '../controllers/section.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Public routes
router.get('/', getAllSections);
router.get('/type/:type', getSectionByType);
router.get('/:id', getSectionById);

// Protected routes (admin only)
// Temporarily removing authentication for development
router.post('/', createSection);
router.put('/:id', updateSection);
router.delete('/:id', deleteSection);

export default router;