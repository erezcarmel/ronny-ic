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
import { uploadMiddleware } from '../middleware/upload.middleware';

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

// File upload route
router.post('/upload', uploadMiddleware.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Return the file URL
    const fileUrl = `${req.protocol}://${req.get('host')}/${req.file.path}`;
    
    res.status(200).json({
      message: 'File uploaded successfully',
      url: fileUrl,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ message: 'Error uploading file' });
  }
});

export default router;