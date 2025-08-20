import { Request, Response } from 'express';
import prisma from '../utils/prisma';

// Get all sections
export const getAllSections = async (req: Request, res: Response) => {
  try {
    const { language = 'en', type } = req.query;
    
    const sections = await prisma.section.findMany({
      where: {
        ...(type ? { type: String(type) } : {}),
        isPublished: true,
      },
      include: {
        contents: {
          where: {
            language: String(language),
          },
        },
      },
      orderBy: {
        orderIndex: 'asc',
      },
    });

    res.status(200).json(sections);
  } catch (error) {
    console.error('Get all sections error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get section by type
export const getSectionByType = async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const { language = 'en' } = req.query;
    
    const section = await prisma.section.findFirst({
      where: { 
        type: String(type),
        isPublished: true 
      },
      include: {
        contents: {
          where: {
            language: String(language),
          },
        },
      },
    });

    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    res.status(200).json(section);
  } catch (error) {
    console.error('Get section by type error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get section by ID
export const getSectionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { language = 'en', admin = 'false' } = req.query;
    
    // For admin view, include all languages
    const section = await prisma.section.findUnique({
      where: { id },
      include: {
        contents: admin === 'true' ? true : {
          where: {
            language: String(language),
          },
        },
      },
    });

    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    res.status(200).json(section);
  } catch (error) {
    console.error('Get section by ID error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create new section
export const createSection = async (req: Request, res: Response) => {
  try {
    const { name, type, orderIndex, isPublished = true, contents } = req.body;

    // Validate input
    if (!name || !type || orderIndex === undefined || !contents || !Array.isArray(contents)) {
      return res.status(400).json({ message: 'Name, type, orderIndex, and contents array are required' });
    }

    // Create section with contents
    const section = await prisma.section.create({
      data: {
        name,
        type,
        orderIndex,
        isPublished,
        contents: {
          create: contents.map((content: any) => ({
            language: content.language,
            title: content.title,
            subtitle: content.subtitle,
            content: content.content,
            imageUrl: content.imageUrl,
          })),
        },
      },
      include: {
        contents: true,
      },
    });

    res.status(201).json(section);
  } catch (error) {
    console.error('Create section error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update section
export const updateSection = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, type, orderIndex, isPublished, contents } = req.body;

    // Check if section exists
    const existingSection = await prisma.section.findUnique({
      where: { id },
    });

    if (!existingSection) {
      return res.status(404).json({ message: 'Section not found' });
    }

    // Update section
    const updatedSection = await prisma.section.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(type && { type }),
        ...(orderIndex !== undefined && { orderIndex }),
        ...(isPublished !== undefined && { isPublished }),
      },
      include: {
        contents: true,
      },
    });

    // Update contents if provided
    if (contents && Array.isArray(contents)) {
      for (const content of contents) {
        if (content.id) {
          // Update existing content
          await prisma.sectionContent.update({
            where: { id: content.id },
            data: {
              ...(content.title !== undefined && { title: content.title }),
              ...(content.subtitle !== undefined && { subtitle: content.subtitle }),
              ...(content.content !== undefined && { content: content.content }),
              ...(content.imageUrl !== undefined && { imageUrl: content.imageUrl }),
            },
          });
        } else {
          // Check if content for this language already exists
          const existingContent = await prisma.sectionContent.findFirst({
            where: {
              sectionId: id,
              language: content.language,
            },
          });
          
          if (existingContent) {
            // Update existing content
            await prisma.sectionContent.update({
              where: { id: existingContent.id },
              data: {
                title: content.title,
                subtitle: content.subtitle,
                content: content.content,
                imageUrl: content.imageUrl,
              },
            });
          } else {
            // Create new content
            await prisma.sectionContent.create({
              data: {
                sectionId: id,
                language: content.language,
                title: content.title,
                subtitle: content.subtitle,
                content: content.content,
                imageUrl: content.imageUrl,
              },
            });
          }
        }
      }
    }

    // Get updated section with contents
    const sectionWithContents = await prisma.section.findUnique({
      where: { id },
      include: {
        contents: true,
      },
    });

    res.status(200).json(sectionWithContents);
  } catch (error) {
    console.error('Update section error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete section
export const deleteSection = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if section exists
    const existingSection = await prisma.section.findUnique({
      where: { id },
    });

    if (!existingSection) {
      return res.status(404).json({ message: 'Section not found' });
    }

    // Delete section (cascade will delete contents)
    await prisma.section.delete({
      where: { id },
    });

    res.status(200).json({ message: 'Section deleted successfully' });
  } catch (error) {
    console.error('Delete section error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};