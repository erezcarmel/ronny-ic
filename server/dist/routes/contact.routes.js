"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const contact_controller_1 = require("../controllers/contact.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// Public routes
router.post('/send', contact_controller_1.sendContactMessage);
router.get('/info', contact_controller_1.getContactInfo);
// Protected routes (admin only)
router.put('/info', auth_middleware_1.authenticate, contact_controller_1.updateContactInfo);
exports.default = router;
//# sourceMappingURL=contact.routes.js.map