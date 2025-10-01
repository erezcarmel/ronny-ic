"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const section_controller_1 = require("../controllers/section.controller");
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
exports.default = router;
//# sourceMappingURL=section.routes.js.map