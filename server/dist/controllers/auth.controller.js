"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = exports.refreshToken = exports.login = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../utils/prisma"));
// Login controller
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        // Find user by email
        const user = await prisma_1.default.user.findUnique({
            where: { email },
        });
        // Check if user exists
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        // Compare passwords
        const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        // Generate access token
        const accessToken = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'fallback_secret');
        // Generate refresh token
        const refreshToken = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret');
        // Return tokens and user info (excluding password)
        const { password: _, ...userWithoutPassword } = user;
        res.status(200).json({
            user: userWithoutPassword,
            accessToken,
            refreshToken,
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.login = login;
// Refresh token controller
const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ message: 'Refresh token is required' });
        }
        // Verify refresh token
        const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret');
        // Find user by ID
        const user = await prisma_1.default.user.findUnique({
            where: { id: decoded.id },
        });
        if (!user) {
            return res.status(401).json({ message: 'Invalid refresh token' });
        }
        // Generate new access token
        const accessToken = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'fallback_secret');
        res.status(200).json({ accessToken });
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return res.status(401).json({ message: 'Invalid or expired refresh token' });
        }
        console.error('Refresh token error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.refreshToken = refreshToken;
// Register new user (admin only)
const register = async (req, res) => {
    try {
        const { email, password, name, role } = req.body;
        // Validate input
        if (!email || !password || !name) {
            return res.status(400).json({ message: 'Email, password, and name are required' });
        }
        // Check if user already exists
        const existingUser = await prisma_1.default.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return res.status(409).json({ message: 'User with this email already exists' });
        }
        // Hash password
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        // Create new user
        const newUser = await prisma_1.default.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: role || 'admin',
            },
        });
        // Return user info (excluding password)
        const { password: _, ...userWithoutPassword } = newUser;
        res.status(201).json(userWithoutPassword);
    }
    catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.register = register;
//# sourceMappingURL=auth.controller.js.map