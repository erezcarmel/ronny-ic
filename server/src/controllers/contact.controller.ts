import { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import prisma from '../utils/prisma';

// Send contact message
export const sendContactMessage = async (req: Request, res: Response) => {
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
    const transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: parseInt(EMAIL_PORT),
      secure: parseInt(EMAIL_PORT) === 465, // true for 465, false for other ports
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

    // Get contact info to determine recipient
    const contactInfo = await prisma.contactInfo.findFirst({
      where: {
        language: 'en', // Default to English
      },
    });

    const recipientEmail = contactInfo?.email || EMAIL_FROM;

    // Send email
    await transporter.sendMail({
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
  } catch (error) {
    console.error('Send contact message error:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
};

// Get contact information
export const getContactInfo = async (req: Request, res: Response) => {
  try {
    const { language = 'en' } = req.query;
    
    const contactInfo = await prisma.contactInfo.findFirst({
      where: {
        language: String(language),
      },
    });

    if (!contactInfo) {
      return res.status(404).json({ message: 'Contact information not found' });
    }

    res.status(200).json(contactInfo);
  } catch (error) {
    console.error('Get contact info error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update contact information
export const updateContactInfo = async (req: Request, res: Response) => {
  try {
    const { language, phone, email, whatsapp, address, mapUrl } = req.body;

    // Validate input
    if (!language) {
      return res.status(400).json({ message: 'Language is required' });
    }

    // Check if contact info exists for this language
    const existingInfo = await prisma.contactInfo.findFirst({
      where: {
        language,
      },
    });

    let contactInfo;

    if (existingInfo) {
      // Update existing contact info
      contactInfo = await prisma.contactInfo.update({
        where: {
          id: existingInfo.id,
        },
        data: {
          ...(phone !== undefined && { phone }),
          ...(email !== undefined && { email }),
          ...(whatsapp !== undefined && { whatsapp }),
          ...(address !== undefined && { address }),
          ...(mapUrl !== undefined && { mapUrl }),
        },
      });
    } else {
      // Create new contact info
      contactInfo = await prisma.contactInfo.create({
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
  } catch (error) {
    console.error('Update contact info error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};