"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadArticleFile = exports.deleteArticle = exports.updateArticle = exports.createArticle = exports.getArticleById = exports.getAllArticles = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const path_1 = __importDefault(require("path"));
// Get all articles
const getAllArticles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { language = 'en', published } = req.query;
        // Build the where clause based on the published parameter
        const whereClause = {};
        // Only filter by published state if the parameter is provided
        if (published !== undefined) {
            whereClause.isPublished = published === 'true';
        }
        // Get all articles with their contents
        const articles = yield prisma_1.default.article.findMany({
            where: whereClause,
            include: {
                contents: true, // Include all contents regardless of language
            },
            orderBy: {
                publishDate: 'desc',
            },
        });
        // Log the first article to debug
        if (articles.length > 0) {
            console.log(`First article has ${articles[0].contents.length} content entries`);
        }
        res.status(200).json(articles);
    }
    catch (error) {
        console.error('Get all articles error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getAllArticles = getAllArticles;
// Get article by ID
const getArticleById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { language = 'en' } = req.query;
        const article = yield prisma_1.default.article.findUnique({
            where: { id },
            include: {
                contents: {
                    where: {
                        language: String(language),
                    },
                },
            },
        });
        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }
        res.status(200).json(article);
    }
    catch (error) {
        console.error('Get article by ID error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getArticleById = getArticleById;
// Create new article
const createArticle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { slug, isPublished = false, publishDate, contents } = req.body;
        // Validate input
        if (!slug || !contents || !Array.isArray(contents)) {
            return res.status(400).json({ message: 'Slug and contents array are required' });
        }
        // Check if slug already exists
        const existingArticle = yield prisma_1.default.article.findUnique({
            where: { slug },
        });
        if (existingArticle) {
            return res.status(409).json({ message: 'Article with this slug already exists' });
        }
        // Create article with contents
        const article = yield prisma_1.default.article.create({
            data: {
                slug,
                isPublished,
                publishDate: publishDate ? new Date(publishDate) : undefined,
                contents: {
                    create: contents.map((content) => ({
                        language: content.language,
                        title: content.title || "",
                        excerpt: content.excerpt || "",
                        content: content.content || "",
                        pdfUrl: content.pdfUrl || null,
                        imageUrl: content.imageUrl || null,
                    })),
                },
            },
            include: {
                contents: true,
            },
        });
        res.status(201).json(article);
    }
    catch (error) {
        console.error('Create article error:', error);
        // Provide more detailed error message for client debugging
        if (error.code === 'P2002') {
            return res.status(409).json({
                message: 'Unique constraint failed',
                details: 'An article with this slug or content language combination already exists.',
                fields: (_a = error.meta) === null || _a === void 0 ? void 0 : _a.target
            });
        }
        res.status(500).json({
            message: 'Internal server error',
            details: error.message || String(error)
        });
    }
});
exports.createArticle = createArticle;
// Update article
const updateArticle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const { slug, isPublished, publishDate, contents } = req.body;
        // Check if article exists
        const existingArticle = yield prisma_1.default.article.findUnique({
            where: { id },
        });
        if (!existingArticle) {
            return res.status(404).json({ message: 'Article not found' });
        }
        // Check if slug is unique if changing
        if (slug && slug !== existingArticle.slug) {
            const slugExists = yield prisma_1.default.article.findUnique({
                where: { slug },
            });
            if (slugExists) {
                return res.status(409).json({ message: 'Article with this slug already exists' });
            }
        }
        // Update article
        const updatedArticle = yield prisma_1.default.article.update({
            where: { id },
            data: Object.assign(Object.assign(Object.assign({}, (slug && { slug })), (isPublished !== undefined && { isPublished })), (publishDate !== undefined && { publishDate: publishDate ? new Date(publishDate) : null })),
            include: {
                contents: true,
            },
        });
        // Update contents if provided
        if (contents && Array.isArray(contents)) {
            for (const content of contents) {
                if (content.id) {
                    // Update existing content with ID
                    yield prisma_1.default.articleContent.update({
                        where: { id: content.id },
                        data: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (content.title !== undefined && { title: content.title })), (content.excerpt !== undefined && { excerpt: content.excerpt })), (content.content !== undefined && { content: content.content })), (content.pdfUrl !== undefined && { pdfUrl: content.pdfUrl })), (content.imageUrl !== undefined && { imageUrl: content.imageUrl })),
                    });
                }
                else {
                    // Check if content for this language already exists
                    const existingContent = yield prisma_1.default.articleContent.findFirst({
                        where: {
                            articleId: id,
                            language: content.language
                        }
                    });
                    if (existingContent) {
                        // Update existing content for this language
                        yield prisma_1.default.articleContent.update({
                            where: { id: existingContent.id },
                            data: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (content.title !== undefined && { title: content.title })), (content.excerpt !== undefined && { excerpt: content.excerpt })), (content.content !== undefined && { content: content.content })), (content.pdfUrl !== undefined && { pdfUrl: content.pdfUrl })), (content.imageUrl !== undefined && { imageUrl: content.imageUrl })),
                        });
                    }
                    else {
                        // Create new content
                        yield prisma_1.default.articleContent.create({
                            data: {
                                articleId: id,
                                language: content.language,
                                title: content.title || "",
                                excerpt: content.excerpt || "",
                                content: content.content || "",
                                pdfUrl: content.pdfUrl,
                                imageUrl: content.imageUrl,
                            },
                        });
                    }
                }
            }
        }
        // Get updated article with contents
        const articleWithContents = yield prisma_1.default.article.findUnique({
            where: { id },
            include: {
                contents: true,
            },
        });
        res.status(200).json(articleWithContents);
    }
    catch (error) {
        console.error('Update article error:', error);
        // Provide more detailed error message for client debugging
        if (error.code === 'P2002') {
            return res.status(409).json({
                message: 'Unique constraint failed',
                details: 'An article content with this language already exists for this article.',
                fields: (_a = error.meta) === null || _a === void 0 ? void 0 : _a.target
            });
        }
        res.status(500).json({
            message: 'Internal server error',
            details: error.message || String(error)
        });
    }
});
exports.updateArticle = updateArticle;
// Delete article
const deleteArticle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Check if article exists
        const existingArticle = yield prisma_1.default.article.findUnique({
            where: { id },
        });
        if (!existingArticle) {
            return res.status(404).json({ message: 'Article not found' });
        }
        // Delete article (cascade will delete contents)
        yield prisma_1.default.article.delete({
            where: { id },
        });
        res.status(200).json({ message: 'Article deleted successfully' });
    }
    catch (error) {
        console.error('Delete article error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.deleteArticle = deleteArticle;
// Upload file for article (PDF or image)
const uploadArticleFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        // Create media record
        const media = yield prisma_1.default.media.create({
            data: {
                filename: req.file.originalname,
                path: req.file.path,
                type: req.file.mimetype.startsWith('image/') ? 'image' : 'pdf',
                size: req.file.size,
                mimeType: req.file.mimetype,
            },
        });
        // Generate URL for the uploaded file
        const fileUrl = `/uploads/${path_1.default.basename(req.file.path)}`;
        res.status(201).json({
            media,
            url: fileUrl,
        });
    }
    catch (error) {
        console.error('Upload article file error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.uploadArticleFile = uploadArticleFile;
//# sourceMappingURL=article.controller.js.map