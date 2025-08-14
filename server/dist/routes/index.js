"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_routes_1 = __importDefault(require("./auth.routes"));
const section_routes_1 = __importDefault(require("./section.routes"));
const article_routes_1 = __importDefault(require("./article.routes"));
const contact_routes_1 = __importDefault(require("./contact.routes"));
const router = express_1.default.Router();
// Health check endpoint
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});
// API routes
router.use('/auth', auth_routes_1.default);
router.use('/sections', section_routes_1.default);
router.use('/articles', article_routes_1.default);
router.use('/contact', contact_routes_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map