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
const prisma_1 = require("../generated/prisma");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new prisma_1.PrismaClient();
function createAdminUser() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Check if admin user already exists
            const existingAdmin = yield prisma.user.findUnique({
                where: { email: 'admin@example.com' },
            });
            if (existingAdmin) {
                return;
            }
            // Create admin user
            const hashedPassword = yield bcrypt_1.default.hash('admin123', 10);
            const user = yield prisma.user.create({
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
            yield prisma.$disconnect();
        }
    });
}
createAdminUser();
//# sourceMappingURL=createAdminUser.js.map