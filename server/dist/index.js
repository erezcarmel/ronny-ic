"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_rate_limit_1 = require("express-rate-limit");
const routes_1 = __importDefault(require("./routes"));
const createDefaultContactInfo_1 = __importDefault(require("./scripts/createDefaultContactInfo"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, helmet_1.default)()); // Security headers
app.use((0, cors_1.default)()); // CORS support
app.use(express_1.default.json({ limit: '50mb' })); // Parse JSON bodies with increased limit
app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' })); // Parse URL-encoded bodies with increased limit
// Rate limiting
const limiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
});
// Apply rate limiting to all requests
app.use(limiter);
// Routes
app.use('/api', routes_1.default);
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
    });
});
// Start server first
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    // Try to set up contact info, but don't crash if database is not available
    (0, createDefaultContactInfo_1.default)()
        .then(() => {
        console.log('Contact information setup complete');
    })
        .catch((error) => {
        console.error('Error setting up contact information:', error);
        console.log('Server will continue running without contact info setup');
    });
});
exports.default = app;
//# sourceMappingURL=index.js.map