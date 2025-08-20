import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import path from 'path';

// Get all articles
export const getAllArticles = async (req: Request, res: Response) => {
  try {
    const { language = 'en', published } = req.query;
    
    // Build the where clause based on the published parameter
    const whereClause: any = {};
    
    // Only filter by published state if the parameter is provided
    if (published !== undefined) {
      whereClause.isPublished = published === 'true';
    }
    
    // Get all articles with their contents
    const articles = await prisma.article.findMany({
      where: whereClause,
      include: {
        contents: true, // Include all contents regardless of language
      },
      orderBy: {
        publishDate: 'desc',
      },
    });
    
    // Log the first article to debug
    if (articles.length > 0) {
      console.log(`First article has ${articles[0].contents.length} content entries`);
    }

    res.status(200).json(articles);
  } catch (error) {
    console.error('Get all articles error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get article by ID
export const getArticleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { language = 'en' } = req.query;
    
    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        contents: {
          where: {
            language: String(language),
          },
        },
      },
    });

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    res.status(200).json(article);
  } catch (error) {
    console.error('Get article by ID error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create new article
export const createArticle = async (req: Request, res: Response) => {
  try {
    const { slug, isPublished = false, publishDate, contents } = req.body;

    // Validate input
    if (!slug || !contents || !Array.isArray(contents)) {
      return res.status(400).json({ message: 'Slug and contents array are required' });
    }

    // Check if slug already exists
    const existingArticle = await prisma.article.findUnique({
      where: { slug },
    });

    if (existingArticle) {
      return res.status(409).json({ message: 'Article with this slug already exists' });
    }

    // Create article with contents
    const article = await prisma.article.create({
      data: {
        slug,
        isPublished,
        publishDate: publishDate ? new Date(publishDate) : undefined,
        contents: {
          create: contents.map((content: any) => ({
            language: content.language,
            title: content.title || "",
            excerpt: content.excerpt || "",
            content: content.content || "",
            pdfUrl: content.pdfUrl || null,
            imageUrl: content.imageUrl || null,
          })),
        },
      },
      include: {
        contents: true,
      },
    });

    res.status(201).json(article);
  } catch (error: any) {
    console.error('Create article error:', error);
    
    // Provide more detailed error message for client debugging
    if (error.code === 'P2002') {
      return res.status(409).json({ 
        message: 'Unique constraint failed', 
        details: 'An article with this slug or content language combination already exists.',
        fields: error.meta?.target
      });
    }
    
    res.status(500).json({ 
      message: 'Internal server error', 
      details: error.message || String(error)
    });
  }
};

// Update article
export const updateArticle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { slug, isPublished, publishDate, contents } = req.body;

    // Check if article exists
    const existingArticle = await prisma.article.findUnique({
      where: { id },
    });

    if (!existingArticle) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Check if slug is unique if changing
    if (slug && slug !== existingArticle.slug) {
      const slugExists = await prisma.article.findUnique({
        where: { slug },
      });

      if (slugExists) {
        return res.status(409).json({ message: 'Article with this slug already exists' });
      }
    }

    // Update article
    const updatedArticle = await prisma.article.update({
      where: { id },
      data: {
        ...(slug && { slug }),
        ...(isPublished !== undefined && { isPublished }),
        ...(publishDate !== undefined && { publishDate: publishDate ? new Date(publishDate) : null }),
      },
      include: {
        contents: true,
      },
    });

    // Update contents if provided
    if (contents && Array.isArray(contents)) {
      for (const content of contents) {
        if (content.id) {
          // Update existing content with ID
          await prisma.articleContent.update({
            where: { id: content.id },
            data: {
              ...(content.title !== undefined && { title: content.title }),
              ...(content.excerpt !== undefined && { excerpt: content.excerpt }),
              ...(content.content !== undefined && { content: content.content }),
              ...(content.pdfUrl !== undefined && { pdfUrl: content.pdfUrl }),
              ...(content.imageUrl !== undefined && { imageUrl: content.imageUrl }),
            },
          });
        } else {
          // Check if content for this language already exists
          const existingContent = await prisma.articleContent.findFirst({
            where: {
              articleId: id,
              language: content.language
            }
          });
          
          if (existingContent) {
            // Update existing content for this language
            await prisma.articleContent.update({
              where: { id: existingContent.id },
              data: {
                ...(content.title !== undefined && { title: content.title }),
                ...(content.excerpt !== undefined && { excerpt: content.excerpt }),
                ...(content.content !== undefined && { content: content.content }),
                ...(content.pdfUrl !== undefined && { pdfUrl: content.pdfUrl }),
                ...(content.imageUrl !== undefined && { imageUrl: content.imageUrl }),
              },
            });
          } else {
            // Create new content
            await prisma.articleContent.create({
              data: {
                articleId: id,
                language: content.language,
                title: content.title || "",
                excerpt: content.excerpt || "",
                content: content.content || "",
                pdfUrl: content.pdfUrl,
                imageUrl: content.imageUrl,
              },
            });
          }
        }
      }
    }

    // Get updated article with contents
    const articleWithContents = await prisma.article.findUnique({
      where: { id },
      include: {
        contents: true,
      },
    });

    res.status(200).json(articleWithContents);
  } catch (error: any) {
    console.error('Update article error:', error);
    
    // Provide more detailed error message for client debugging
    if (error.code === 'P2002') {
      return res.status(409).json({ 
        message: 'Unique constraint failed', 
        details: 'An article content with this language already exists for this article.',
        fields: error.meta?.target
      });
    }
    
    res.status(500).json({ 
      message: 'Internal server error', 
      details: error.message || String(error)
    });
  }
};

// Delete article
export const deleteArticle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if article exists
    const existingArticle = await prisma.article.findUnique({
      where: { id },
    });

    if (!existingArticle) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Delete article (cascade will delete contents)
    await prisma.article.delete({
      where: { id },
    });

    res.status(200).json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error('Delete article error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Upload file for article (PDF or image)
export const uploadArticleFile = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Create media record
    const media = await prisma.media.create({
      data: {
        filename: req.file.originalname,
        path: req.file.path,
        type: req.file.mimetype.startsWith('image/') ? 'image' : 'pdf',
        size: req.file.size,
        mimeType: req.file.mimetype,
      },
    });

    // Generate URL for the uploaded file
    const fileUrl = `/uploads/${path.basename(req.file.path)}`;

    res.status(201).json({
      media,
      url: fileUrl,
    });
  } catch (error) {
    console.error('Upload article file error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};