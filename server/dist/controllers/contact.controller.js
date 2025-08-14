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
exports.updateContactInfo = exports.getContactInfo = exports.sendContactMessage = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const prisma_1 = __importDefault(require("../utils/prisma"));
// Send contact message
const sendContactMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, subject, message } = req.body;
        // Validate input
        if (!name || !email || !message) {
            return res.status(400).json({ message: 'Name, email, and message are required' });
        }
        // Get email configuration from environment variables
        const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM } = process.env;
        if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASS || !EMAIL_FROM) {
            console.error('Email configuration missing');
            return res.status(500).json({ message: 'Email service not configured' });
        }
        // Create nodemailer transporter
        const transporter = nodemailer_1.default.createTransport({
            host: EMAIL_HOST,
            port: parseInt(EMAIL_PORT),
            secure: parseInt(EMAIL_PORT) === 465, // true for 465, false for other ports
            auth: {
                user: EMAIL_USER,
                pass: EMAIL_PASS,
            },
        });
        // Get contact info to determine recipient
        const contactInfo = yield prisma_1.default.contactInfo.findFirst({
            where: {
                language: 'en', // Default to English
            },
        });
        const recipientEmail = (contactInfo === null || contactInfo === void 0 ? void 0 : contactInfo.email) || EMAIL_FROM;
        // Send email
        yield transporter.sendMail({
            from: `"${name}" <${EMAIL_FROM}>`,
            to: recipientEmail,
            replyTo: email,
            subject: subject || `New contact message from ${name}`,
            text: message,
            html: `
        <div>
          <h2>New Contact Message</h2>
          <p><strong>From:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
        </div>
      `,
        });
        res.status(200).json({ message: 'Message sent successfully' });
    }
    catch (error) {
        console.error('Send contact message error:', error);
        res.status(500).json({ message: 'Failed to send message' });
    }
});
exports.sendContactMessage = sendContactMessage;
// Get contact information
const getContactInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { language = 'en' } = req.query;
        const contactInfo = yield prisma_1.default.contactInfo.findFirst({
            where: {
                language: String(language),
            },
        });
        if (!contactInfo) {
            return res.status(404).json({ message: 'Contact information not found' });
        }
        res.status(200).json(contactInfo);
    }
    catch (error) {
        console.error('Get contact info error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getContactInfo = getContactInfo;
// Update contact information
const updateContactInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { language, phone, email, whatsapp, address, mapUrl } = req.body;
        // Validate input
        if (!language) {
            return res.status(400).json({ message: 'Language is required' });
        }
        // Check if contact info exists for this language
        const existingInfo = yield prisma_1.default.contactInfo.findFirst({
            where: {
                language,
            },
        });
        let contactInfo;
        if (existingInfo) {
            // Update existing contact info
            contactInfo = yield prisma_1.default.contactInfo.update({
                where: {
                    id: existingInfo.id,
                },
                data: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (phone !== undefined && { phone })), (email !== undefined && { email })), (whatsapp !== undefined && { whatsapp })), (address !== undefined && { address })), (mapUrl !== undefined && { mapUrl })),
            });
        }
        else {
            // Create new contact info
            contactInfo = yield prisma_1.default.contactInfo.create({
                data: {
                    language,
                    phone,
                    email,
                    whatsapp,
                    address,
                    mapUrl,
                },
            });
        }
        res.status(200).json(contactInfo);
    }
    catch (error) {
        console.error('Update contact info error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.updateContactInfo = updateContactInfo;
//# sourceMappingURL=contact.controller.js.map