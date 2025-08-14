import express from 'express';
import authRoutes from './auth.routes';
import sectionRoutes from './section.routes';
import articleRoutes from './article.routes';
import contactRoutes from './contact.routes';

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// API routes
router.use('/auth', authRoutes);
router.use('/sections', sectionRoutes);
router.use('/articles', articleRoutes);
router.use('/contact', contactRoutes);

export default router;