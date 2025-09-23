"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const section_controller_1 = require("../controllers/section.controller");
const upload_middleware_1 = require("../middleware/upload.middleware");
const router = express_1.default.Router();
// Public routes
router.get('/', section_controller_1.getAllSections);
router.get('/type/:type', section_controller_1.getSectionByType);
router.get('/:id', section_controller_1.getSectionById);
// Protected routes (admin only)
// Temporarily removing authentication for development
router.post('/', section_controller_1.createSection);
router.put('/:id', section_controller_1.updateSection);
router.delete('/:id', section_controller_1.deleteSection);
// File upload route
router.post('/upload', upload_middleware_1.uploadMiddleware.single('file'), (req, res) => {
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
    }
    catch (error) {
        console.error('File upload error:', error);
        res.status(500).json({ message: 'Error uploading file' });
    }
});
exports.default = router;
//# sourceMappingURL=section.routes.js.map