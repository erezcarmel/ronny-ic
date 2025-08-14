import express from 'express';
import { 
  getAllArticles, 
  getArticleById, 
  createArticle, 
  updateArticle, 
  deleteArticle,
  uploadArticleFile
} from '../controllers/article.controller';
import { authenticate } from '../middleware/auth.middleware';
import { uploadMiddleware } from '../middleware/upload.middleware';

const router = express.Router();

// Public routes
router.get('/', getAllArticles);
router.get('/:id', getArticleById);

// Protected routes (admin only)
router.post('/', authenticate, createArticle);
router.put('/:id', authenticate, updateArticle);
router.delete('/:id', authenticate, deleteArticle);

// File upload route for articles (PDFs, images)
router.post('/upload', authenticate, uploadMiddleware.single('file'), uploadArticleFile);

export default router;