import express from 'express';
import { 
  getAllArticles, 
  getArticleById, 
  createArticle, 
  updateArticle, 
  deleteArticle
} from '../controllers/article.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Public routes
router.get('/', getAllArticles);
router.get('/:id', getArticleById);

// Protected routes (admin only)
router.post('/', authenticate, createArticle);
router.put('/:id', authenticate, updateArticle);
router.delete('/:id', authenticate, deleteArticle);

export default router;