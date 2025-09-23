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
const prisma_1 = __importDefault(require("../utils/prisma"));
function createDefaultContactInfo() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('Creating default contact information...');
            // Test database connection first
            try {
                yield prisma_1.default.$connect();
                console.log('Database connection successful');
            }
            catch (dbError) {
                console.error('Database connection failed:', dbError);
                return; // Exit function but don't crash the application
            }
            // Check if English contact info exists
            const existingEnInfo = yield prisma_1.default.contactInfo.findFirst({
                where: { language: 'en' },
            });
            if (!existingEnInfo) {
                yield prisma_1.default.contactInfo.create({
                    data: {
                        language: 'en',
                        phone: '+1 (555) 123-4567',
                        email: 'contact@example.com',
                        whatsapp: '+1 (555) 123-4567',
                        address: '123 Main Street, City, Country',
                        mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3381.7772705714377!2d34.7805092!3d32.0852999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x151d4b70e095df95%3A0xfc0b9982ce0f0a4!2sTel%20Aviv-Yafo%2C%20Israel!5e0!3m2!1sen!2sus!4v1625123456789!5m2!1sen!2sus',
                    },
                });
                console.log('Created default English contact information');
            }
            else {
                console.log('English contact information already exists');
            }
            // Check if Hebrew contact info exists
            const existingHeInfo = yield prisma_1.default.contactInfo.findFirst({
                where: { language: 'he' },
            });
            if (!existingHeInfo) {
                yield prisma_1.default.contactInfo.create({
                    data: {
                        language: 'he',
                        phone: '+1 (555) 123-4567',
                        email: 'contact@example.com',
                        whatsapp: '+1 (555) 123-4567',
                        address: 'רחוב ראשי 123, עיר, מדינה',
                        mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3381.7772705714377!2d34.7805092!3d32.0852999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x151d4b70e095df95%3A0xfc0b9982ce0f0a4!2sTel%20Aviv-Yafo%2C%20Israel!5e0!3m2!1sen!2sus!4v1625123456789!5m2!1sen!2sus',
                    },
                });
                console.log('Created default Hebrew contact information');
            }
            else {
                console.log('Hebrew contact information already exists');
            }
            console.log('Default contact information setup complete');
        }
        catch (error) {
            console.error('Error creating default contact information:', error);
            // Don't exit the process with error code, just log the error
        }
        finally {
            try {
                yield prisma_1.default.$disconnect();
            }
            catch (disconnectError) {
                console.error('Error disconnecting from database:', disconnectError);
            }
        }
    });
}
// Run the function if this script is executed directly
if (require.main === module) {
    createDefaultContactInfo()
        .then(() => process.exit(0))
        .catch((error) => {
        console.error('Unhandled error:', error);
        // Don't exit with error code when run as a script
        // to allow for local development without database
        process.exit(0);
    });
}
exports.default = createDefaultContactInfo;
//# sourceMappingURL=createDefaultContactInfo.js.map