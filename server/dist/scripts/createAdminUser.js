"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function createAdminUser() {
    try {
        // Check if admin user already exists
        const existingAdmin = await prisma.user.findUnique({
            where: { email: 'admin@example.com' },
        });
        if (existingAdmin) {
            return;
        }
        // Create admin user
        const hashedPassword = await bcrypt_1.default.hash('admin123', 10);
        const user = await prisma.user.create({
            data: {
                email: 'admin@example.com',
                password: hashedPassword,
                name: 'Admin User',
                role: 'admin',
            },
        });
    }
    catch (error) {
        console.error('Error creating admin user:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
createAdminUser();
//# sourceMappingURL=createAdminUser.js.map