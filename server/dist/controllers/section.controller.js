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
exports.deleteSection = exports.updateSection = exports.createSection = exports.getSectionById = exports.getAllSections = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
// Get all sections
const getAllSections = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { language = 'en', type } = req.query;
        const sections = yield prisma_1.default.section.findMany({
            where: Object.assign(Object.assign({}, (type ? { type: String(type) } : {})), { isPublished: true }),
            include: {
                contents: {
                    where: {
                        language: String(language),
                    },
                },
            },
            orderBy: {
                orderIndex: 'asc',
            },
        });
        res.status(200).json(sections);
    }
    catch (error) {
        console.error('Get all sections error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getAllSections = getAllSections;
// Get section by ID
const getSectionById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { language = 'en' } = req.query;
        const section = yield prisma_1.default.section.findUnique({
            where: { id },
            include: {
                contents: {
                    where: {
                        language: String(language),
                    },
                },
            },
        });
        if (!section) {
            return res.status(404).json({ message: 'Section not found' });
        }
        res.status(200).json(section);
    }
    catch (error) {
        console.error('Get section by ID error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getSectionById = getSectionById;
// Create new section
const createSection = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, type, orderIndex, isPublished = true, contents } = req.body;
        // Validate input
        if (!name || !type || orderIndex === undefined || !contents || !Array.isArray(contents)) {
            return res.status(400).json({ message: 'Name, type, orderIndex, and contents array are required' });
        }
        // Create section with contents
        const section = yield prisma_1.default.section.create({
            data: {
                name,
                type,
                orderIndex,
                isPublished,
                contents: {
                    create: contents.map((content) => ({
                        language: content.language,
                        title: content.title,
                        subtitle: content.subtitle,
                        content: content.content,
                        imageUrl: content.imageUrl,
                    })),
                },
            },
            include: {
                contents: true,
            },
        });
        res.status(201).json(section);
    }
    catch (error) {
        console.error('Create section error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.createSection = createSection;
// Update section
const updateSection = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, type, orderIndex, isPublished, contents } = req.body;
        // Check if section exists
        const existingSection = yield prisma_1.default.section.findUnique({
            where: { id },
        });
        if (!existingSection) {
            return res.status(404).json({ message: 'Section not found' });
        }
        // Update section
        const updatedSection = yield prisma_1.default.section.update({
            where: { id },
            data: Object.assign(Object.assign(Object.assign(Object.assign({}, (name && { name })), (type && { type })), (orderIndex !== undefined && { orderIndex })), (isPublished !== undefined && { isPublished })),
            include: {
                contents: true,
            },
        });
        // Update contents if provided
        if (contents && Array.isArray(contents)) {
            for (const content of contents) {
                if (content.id) {
                    // Update existing content
                    yield prisma_1.default.sectionContent.update({
                        where: { id: content.id },
                        data: Object.assign(Object.assign(Object.assign(Object.assign({}, (content.title !== undefined && { title: content.title })), (content.subtitle !== undefined && { subtitle: content.subtitle })), (content.content !== undefined && { content: content.content })), (content.imageUrl !== undefined && { imageUrl: content.imageUrl })),
                    });
                }
                else {
                    // Create new content
                    yield prisma_1.default.sectionContent.create({
                        data: {
                            sectionId: id,
                            language: content.language,
                            title: content.title,
                            subtitle: content.subtitle,
                            content: content.content,
                            imageUrl: content.imageUrl,
                        },
                    });
                }
            }
        }
        // Get updated section with contents
        const sectionWithContents = yield prisma_1.default.section.findUnique({
            where: { id },
            include: {
                contents: true,
            },
        });
        res.status(200).json(sectionWithContents);
    }
    catch (error) {
        console.error('Update section error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.updateSection = updateSection;
// Delete section
const deleteSection = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Check if section exists
        const existingSection = yield prisma_1.default.section.findUnique({
            where: { id },
        });
        if (!existingSection) {
            return res.status(404).json({ message: 'Section not found' });
        }
        // Delete section (cascade will delete contents)
        yield prisma_1.default.section.delete({
            where: { id },
        });
        res.status(200).json({ message: 'Section deleted successfully' });
    }
    catch (error) {
        console.error('Delete section error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.deleteSection = deleteSection;
//# sourceMappingURL=section.controller.js.map