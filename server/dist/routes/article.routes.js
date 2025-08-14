"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const article_controller_1 = require("../controllers/article.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const upload_middleware_1 = require("../middleware/upload.middleware");
const router = express_1.default.Router();
// Public routes
router.get('/', article_controller_1.getAllArticles);
router.get('/:id', article_controller_1.getArticleById);
// Protected routes (admin only)
router.post('/', auth_middleware_1.authenticate, article_controller_1.createArticle);
router.put('/:id', auth_middleware_1.authenticate, article_controller_1.updateArticle);
router.delete('/:id', auth_middleware_1.authenticate, article_controller_1.deleteArticle);
// File upload route for articles (PDFs, images)
router.post('/upload', auth_middleware_1.authenticate, upload_middleware_1.uploadMiddleware.single('file'), article_controller_1.uploadArticleFile);
exports.default = router;
//# sourceMappingURL=article.routes.js.map