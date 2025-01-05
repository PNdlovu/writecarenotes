/**
 * @writecarenotes.com
 * @fileoverview Article export API route
 * @version 1.0.0
 * @created 2024-01-09
 * @updated 2024-01-09
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * API route for exporting articles in various formats (PDF, Word, etc.).
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { z } from 'zod';

// Validation schema for export format
const exportSchema = z.object({
  format: z.enum(['PDF', 'WORD', 'MARKDOWN', 'HTML'])
});

interface Props {
  params: { slug: string }
}

export async function POST(request: Request, { params }: Props) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const article = await prisma.knowledgeBaseArticle.findUnique({
      where: { slug: params.slug },
      include: {
        category: true,
        author: {
          select: {
            name: true
          }
        }
      }
    });

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    const json = await request.json();
    const { format } = exportSchema.parse(json);

    // Generate export content based on format
    let content = '';
    let contentType = '';
    let filename = '';

    switch (format) {
      case 'MARKDOWN':
        content = generateMarkdown(article);
        contentType = 'text/markdown';
        filename = `${article.slug}.md`;
        break;

      case 'HTML':
        content = generateHtml(article);
        contentType = 'text/html';
        filename = `${article.slug}.html`;
        break;

      case 'PDF':
      case 'WORD':
        return NextResponse.json(
          { error: `${format} export not implemented yet` },
          { status: 501 }
        );
    }

    // Log export activity
    await prisma.knowledgeBaseActivity.create({
      data: {
        type: 'EXPORT',
        articleId: article.id,
        userId: session.user.id,
        metadata: {
          format,
          timestamp: new Date().toISOString()
        }
      }
    });

    return new NextResponse(content, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      );
    }
    console.error('Error exporting article:', error);
    return NextResponse.json(
      { error: 'Failed to export article' },
      { status: 500 }
    );
  }
}

function generateMarkdown(article: any): string {
  return `# ${article.title}

${article.excerpt}

Category: ${article.category.name}
Author: ${article.author.name}
Created: ${article.createdAt}
Last Updated: ${article.updatedAt}

${article.content}

---
Tags: ${article.metadata?.tags?.join(', ') || 'None'}
`;
}

function generateHtml(article: any): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${article.title}</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }
    .metadata {
      color: #666;
      font-size: 0.9rem;
      margin: 1rem 0;
    }
    .content {
      margin-top: 2rem;
    }
    .tags {
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid #eee;
    }
  </style>
</head>
<body>
  <h1>${article.title}</h1>
  
  <div class="metadata">
    <p><strong>Category:</strong> ${article.category.name}</p>
    <p><strong>Author:</strong> ${article.author.name}</p>
    <p><strong>Created:</strong> ${article.createdAt}</p>
    <p><strong>Last Updated:</strong> ${article.updatedAt}</p>
  </div>

  <div class="content">
    ${article.content}
  </div>

  <div class="tags">
    <strong>Tags:</strong> ${article.metadata?.tags?.join(', ') || 'None'}
  </div>
</body>
</html>`;
} 